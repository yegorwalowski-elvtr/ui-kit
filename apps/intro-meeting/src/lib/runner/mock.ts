import { isColorScheme, schemeLabel, type ColorScheme } from "@/lib/colors"

import type {
  CohortSummary,
  IntroMeetingRunner,
  RunRequest,
  RunState,
} from "./types"

/*
 * Mock runner — the default implementation, so the whole flow is clickable with
 * `npm run dev` and nothing else configured.
 *
 * It fabricates NO cohort data: the "course title" is derived from whatever the
 * user typed and the instructor / PM come back null, because only the real skill
 * can read Planna Cotta. Every finished mock run carries a flag saying no deck
 * was actually generated.
 *
 * Which branch you get is decided by the code you type (documented in README.md):
 *   - a code in SEEDED_SCHEMES  -> pair resolved from "Planna", no question
 *   - a code starting with FAIL -> the failure screen
 *   - anything else             -> the "Oops, No Colors Yet!" question
 */

/** Cohorts that pretend to already carry a `color_scheme` in Planna Cotta. */
const SEEDED_SCHEMES: Record<string, ColorScheme> = {
  MDPM1: "purple_turquoise",
  FSD3: "green_lime",
  GD9: "blue_pink",
}

const DISCOVERY_MS = 2_600
const BUILD_MS = 6_400

interface MockRun {
  cohortCode: string
  requestedBy: string
  startedAt: number
  scheme: ColorScheme | null
  schemeSource: "planna" | "user"
  /** When the build phase started, or null while the colour question is open. */
  resumedAt: number | null
  failure: string | null
}

// Survive Next's dev-server module reloads so an in-flight run is not lost on save.
const store: Map<string, MockRun> = ((
  globalThis as { __introMeetingMockRuns?: Map<string, MockRun> }
).__introMeetingMockRuns ??= new Map())

const DISCOVERY_STEPS = [
  "Looking up the cohort in Planna Cotta…",
  "Reading the colour pair and schedule…",
] as const

const BUILD_STEPS = [
  "Resolving the program manager…",
  "Tinting the instructor and PM photos in Figma…",
  "Cloning the colour-matched Gamma template…",
  "Writing in the dates, links and contacts…",
] as const

function summarize(run: MockRun): CohortSummary {
  return {
    cohortCode: run.cohortCode,
    // A mock cannot know the real title — say so rather than invent one.
    courseTitle: `${run.cohortCode} (course title comes from Planna Cotta)`,
    instructorName: null,
    programManager: null,
  }
}

function stepAt(steps: readonly string[], elapsed: number, total: number): string {
  const index = Math.min(steps.length - 1, Math.floor((elapsed / total) * steps.length))
  return steps[Math.max(0, index)]
}

function stateOf(run: MockRun, now: number): RunState {
  if (run.failure) return { status: "failed", error: run.failure }

  const discovery = now - run.startedAt
  if (discovery < DISCOVERY_MS) {
    return { status: "running", step: stepAt(DISCOVERY_STEPS, discovery, DISCOVERY_MS) }
  }

  if (!run.scheme || run.resumedAt === null) {
    return { status: "needs-colors", cohort: summarize(run) }
  }

  const build = now - run.resumedAt
  if (build < BUILD_MS) {
    return { status: "running", step: stepAt(BUILD_STEPS, build, BUILD_MS) }
  }

  return {
    status: "done",
    cohort: summarize(run),
    result: {
      // Deliberately not a gamma.app URL: nothing was generated, and a
      // realistic-looking dead link is worse than an obvious placeholder.
      gammaUrl: `/mock-deck?cohort=${encodeURIComponent(run.cohortCode)}`,
      colorPair: schemeLabel(run.scheme),
      colorPairSource: run.schemeSource,
      flags: [
        "Mock run — no Gamma deck was generated. Point RUNNER at a real implementation to get a live link.",
      ],
    },
  }
}

function newRunId(): string {
  return `run_${globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`
}

export const mockRunner: IntroMeetingRunner = {
  async start(request: RunRequest) {
    const cohortCode = request.cohortCode.trim().toUpperCase()
    const runId = newRunId()
    const seeded = SEEDED_SCHEMES[cohortCode] ?? null
    const startedAt = Date.now()

    const run: MockRun = {
      cohortCode,
      requestedBy: request.requestedBy,
      startedAt,
      scheme: seeded,
      schemeSource: seeded ? "planna" : "user",
      resumedAt: seeded ? startedAt + DISCOVERY_MS : null,
      failure: cohortCode.startsWith("FAIL")
        ? `No cohort named ${cohortCode} in Planna Cotta. Check the code and try again.`
        : null,
    }

    store.set(runId, run)
    return { runId, state: stateOf(run, startedAt) }
  },

  async poll(runId: string) {
    const run = store.get(runId)
    if (!run) return null
    return stateOf(run, Date.now())
  },

  async submitColors(runId: string, scheme: ColorScheme) {
    const run = store.get(runId)
    if (!run) return null
    if (!isColorScheme(scheme)) {
      return { status: "failed", error: `${scheme} is not a valid ELVTR colour pair.` }
    }
    // Ignore a repeat answer so a double-submit cannot restart the build clock.
    if (!run.scheme) {
      run.scheme = scheme
      run.schemeSource = "user"
      run.resumedAt = Date.now()
    }
    return stateOf(run, Date.now())
  },
}
