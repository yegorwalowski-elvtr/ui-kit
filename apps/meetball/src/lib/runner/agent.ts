import { isColorScheme, schemeLabel, COLOR_SCHEMES, type ColorScheme } from "@/lib/colors"
import { PLANNA_SNAPSHOT } from "@/lib/planna-snapshot"

import {
  buildRunPrompt,
  REPORT_RESULT_TOOL,
  REQUEST_COLOR_PAIR_TOOL,
  type ReportedResult,
} from "./agent-protocol"
import { type AgentTransport, type SessionEvent } from "./agent-transport"
import type {
  CohortSuggestion,
  CohortSummary,
  IntroMeetingRunner,
  RunRequest,
  RunState,
} from "./types"

/*
 * The real runner: each run is one Managed Agents session executing the
 * `creative-gamma-intro-meetings` skill.
 *
 * Shape of a run. `start` creates the session and sends the opening message,
 * then leaves a loop consuming the event stream in the background and writing
 * into a record the API's GET handler reads. The UI polls that record, so the
 * stream and the HTTP request cycle stay decoupled — a browser refresh mid-run
 * loses nothing.
 *
 * The colour question is the interesting part. Mid-run the agent may call
 * `request_color_pair`, which parks the session (Managed Agents goes idle
 * awaiting a `user.custom_tool_result`). The loop records the pending tool-use
 * id and flips the run to `needs-colors`; `submitColors` answers that exact
 * tool call and the agent picks up where it left off. No second session, no
 * re-running the Planna lookup.
 */

const STEP_BY_TOOL: Record<string, string> = {
  list_cohorts: "Looking up the cohort in Planna Cotta…",
  get_cohort: "Looking up the cohort in Planna Cotta…",
  list_cohort_classes: "Reading the class schedule…",
  list_holidays: "Cross-checking holidays…",
  get_figma_components: "Finding the instructor photo in Figma…",
  render_figma_image: "Rendering the photos from Figma…",
  upload_assets: "Hosting the tinted photos…",
  use_figma: "Preparing the photo frames in Figma…",
  get_gammas: "Finding the colour-matched template…",
  generate_from_template: "Building the deck in Gamma…",
  get_generation_status: "Waiting for Gamma to finish…",
  bash: "Compositing the photos…",
}

interface AgentRun {
  cohortCode: string
  requestedBy: string
  sessionId: string
  cohort: CohortSummary
  state: RunState
  /** Set while the agent is parked on request_color_pair. */
  pendingColorToolUseId: string | null
}

// Survive Next's dev-server module reloads so an in-flight run is not lost on save.
const runs: Map<string, AgentRun> = ((
  globalThis as { __meetballAgentRuns?: Map<string, AgentRun> }
).__meetballAgentRuns ??= new Map())

function newRunId(): string {
  return `run_${globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`
}

function firstText(event: SessionEvent): string | null {
  const block = event.content?.find((item) => item.type === "text" && item.text?.trim())
  return block?.text?.trim() ?? null
}

function errorText(event: SessionEvent): string {
  if (typeof event.error === "string") return event.error
  return event.error?.message ?? "The run failed before it produced a deck."
}

/** Keeps a progress line to one short sentence, as the UI shows it verbatim. */
function asStep(text: string): string {
  const firstLine = text.split("\n").find((line) => line.trim().length > 0)?.trim() ?? text
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine
}

function parseResult(input: unknown): ReportedResult | null {
  if (typeof input !== "object" || input === null) return null
  const candidate = input as Record<string, unknown>
  const flags = Array.isArray(candidate.flags)
    ? candidate.flags.filter((flag): flag is string => typeof flag === "string")
    : []

  if (typeof candidate.gamma_url !== "string" || candidate.gamma_url.trim() === "") return null

  return {
    gamma_url: candidate.gamma_url,
    color_pair: typeof candidate.color_pair === "string" ? candidate.color_pair : "unknown",
    color_pair_source: candidate.color_pair_source === "operator" ? "operator" : "planna",
    flags,
  }
}

function cohortSummary(cohortCode: string, input: unknown): CohortSummary {
  const courseTitle =
    typeof input === "object" && input !== null &&
    typeof (input as Record<string, unknown>).course_title === "string"
      ? ((input as Record<string, unknown>).course_title as string)
      : cohortCode

  return { cohortCode, courseTitle, instructorName: null, programManager: null }
}

/**
 * Consumes one session's stream to completion, writing each transition into the
 * run record. Never throws into the caller: a stream failure becomes a failed
 * run, because a run stuck on `running` forever is worse than a clear error.
 */
async function follow(runId: string, transport: AgentTransport) {
  const run = runs.get(runId)
  if (!run) return

  try {
    for await (const event of transport.streamEvents(run.sessionId)) {
      const current = runs.get(runId)
      if (!current || current.state.status === "done" || current.state.status === "failed") return

      switch (event.type) {
        case "agent.message": {
          const text = firstText(event)
          if (text && current.state.status === "running") {
            current.state = { status: "running", step: asStep(text) }
          }
          break
        }

        case "agent.tool_use":
        case "agent.mcp_tool_use": {
          const step = event.name ? STEP_BY_TOOL[event.name] : undefined
          if (step && current.state.status === "running") {
            current.state = { status: "running", step }
          }
          break
        }

        case "agent.custom_tool_use": {
          if (event.name === REQUEST_COLOR_PAIR_TOOL && event.id) {
            current.pendingColorToolUseId = event.id
            current.cohort = cohortSummary(current.cohortCode, event.input)
            current.state = { status: "needs-colors", cohort: current.cohort }
          } else if (event.name === REPORT_RESULT_TOOL) {
            const result = parseResult(event.input)
            if (result) {
              current.state = {
                status: "done",
                cohort: current.cohort,
                result: {
                  gammaUrl: result.gamma_url,
                  colorPair: result.color_pair,
                  colorPairSource: result.color_pair_source === "operator" ? "user" : "planna",
                  flags: result.flags,
                },
              }
            } else {
              current.state = {
                status: "failed",
                error: "The run reported a result without a deck link.",
              }
            }
            // Acknowledge so the session can wind down instead of sitting idle.
            if (event.id) {
              await transport
                .sendCustomToolResult(current.sessionId, event.id, "Recorded.")
                .catch(() => undefined)
            }
          }
          break
        }

        case "session.error":
          current.state = { status: "failed", error: asStep(errorText(event)) }
          break

        case "session.status_terminated":
          // Terminated is emitted on success too, so only a run that never
          // reported a result is a failure here.
          if (current.state.status === "running") {
            current.state = {
              status: "failed",
              error: "The run ended without producing a deck. Check the session in the Console.",
            }
          }
          return
      }
    }
  } catch (error) {
    const current = runs.get(runId)
    if (current && current.state.status === "running") {
      current.state = {
        status: "failed",
        error: `Lost contact with the run: ${error instanceof Error ? error.message : "unknown error"}`,
      }
    }
  }
}

export function agentRunner(transport: AgentTransport): IntroMeetingRunner {
  return {
    /*
     * Suggestions and the scheme list deliberately do NOT start an agent
     * session: that would mean a model call per keystroke. They are served from
     * the Planna snapshot and the template list until Meetball has a direct
     * Planna client — the one part of this runner that is not live data.
     */
    async suggestCohorts(query: string) {
      const needle = query.trim().toUpperCase()
      if (needle.length === 0) return []

      const matches: CohortSuggestion[] = PLANNA_SNAPSHOT.filter(
        (cohort) =>
          cohort.code.includes(needle) || cohort.courseTitle.toUpperCase().includes(needle),
      )
        .sort(
          (a, b) =>
            (a.code.startsWith(needle) ? 0 : 1) - (b.code.startsWith(needle) ? 0 : 1) ||
            a.code.localeCompare(b.code),
        )
        .slice(0, 8)
        .map((cohort) => ({ cohortCode: cohort.code, courseTitle: cohort.courseTitle }))

      return matches
    },

    async listColorSchemes() {
      return [...COLOR_SCHEMES]
    },

    async start(request: RunRequest) {
      const cohortCode = request.cohortCode.trim().toUpperCase()
      const runId = newRunId()

      const session = await transport.createSession({
        title: `Meetball · ${cohortCode}`,
      })

      runs.set(runId, {
        cohortCode,
        requestedBy: request.requestedBy,
        sessionId: session.id,
        cohort: { cohortCode, courseTitle: cohortCode, instructorName: null, programManager: null },
        state: { status: "running", step: "Starting the run…" },
        pendingColorToolUseId: null,
      })

      // Stream first, then send: the stream only carries what happens after it
      // opens, so sending first would deliver the early events in one late batch.
      const following = follow(runId, transport)
      await transport.sendUserMessage(
        session.id,
        buildRunPrompt(cohortCode, request.requestedBy),
      )
      void following

      return { runId, state: runs.get(runId)!.state }
    },

    async poll(runId: string) {
      return runs.get(runId)?.state ?? null
    },

    async submitColors(runId: string, scheme: ColorScheme) {
      const run = runs.get(runId)
      if (!run) return null
      if (!isColorScheme(scheme)) {
        return { status: "failed", error: `${scheme} is not a valid ELVTR colour pair.` }
      }
      // A repeat answer must not send a second tool result — the session would
      // reject it and the run would stall.
      if (run.state.status !== "needs-colors" || !run.pendingColorToolUseId) {
        return run.state
      }

      const toolUseId = run.pendingColorToolUseId
      run.pendingColorToolUseId = null
      run.state = { status: "running", step: `Building on ${schemeLabel(scheme)}…` }

      try {
        await transport.sendCustomToolResult(run.sessionId, toolUseId, scheme)
      } catch (error) {
        run.state = {
          status: "failed",
          error: `Could not send the colour pair: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        }
      }

      return run.state
    },
  }
}
