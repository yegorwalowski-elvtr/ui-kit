import { isColorScheme, schemeLabel, COLOR_SCHEMES, type ColorScheme } from "@/lib/colors"
import { PLANNA_SNAPSHOT } from "@/lib/planna-snapshot"

import type {
  CohortSuggestion,
  CohortSummary,
  IntroMeetingRunner,
  RunRequest,
  RunState,
} from "./types"

/*
 * Mock runner — the default implementation, so the whole flow is clickable with
 * `npm run dev` and nothing else configured.
 *
 * It invents no cohort data. Suggestions, course titles and the colour branch
 * all come from `planna-snapshot.ts`, a dated snapshot of real Planna Cotta
 * rows; a code that is not in it comes back "not found", exactly as Planna
 * would answer. Every finished run carries a flag saying no deck was generated.
 *
 * Branches, all reachable from the UI:
 *   - a snapshot cohort WITH a color_scheme  -> pair resolved, no question
 *   - a snapshot cohort WITHOUT one          -> the "Oops, No Colors Yet!" question
 *     (UK-COO3 and MDPM1 genuinely have none in Planna)
 *   - anything else                          -> the failure screen
 */

const DISCOVERY_MS = 2_600
const BUILD_MS = 6_400

interface MockRun {
  cohortCode: string
  courseTitle: string
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

function findCohort(code: string) {
  return PLANNA_SNAPSHOT.find((cohort) => cohort.code === code) ?? null
}

function summarize(run: MockRun): CohortSummary {
  return {
    cohortCode: run.cohortCode,
    courseTitle: run.courseTitle,
    instructorName: null,
    programManager: null,
  }
}

function stepAt(steps: readonly string[], elapsed: number, total: number): string {
  const index = Math.min(steps.length - 1, Math.floor((elapsed / total) * steps.length))
  return steps[Math.max(0, index)]
}

/*
 * The gaps the skill reports instead of guessing. Planna rarely holds a Discord
 * link, so that one always shows; the rest are keyed off the snapshot so the
 * disclaimer stack is not uniformly the same on every cohort.
 */
function flagsFor(run: MockRun): string[] {
  const flags = [
    "No Discord link in Planna Cotta — the deck keeps the template's Discord button as shipped.",
  ]

  if (run.schemeSource === "user") {
    flags.push(
      `Planna Cotta had no colour pair for ${run.cohortCode}; the deck was built on the pair you picked.`,
    )
  }
  flags.push(
    "Mock run — no Gamma deck was generated. Point src/lib/runner/index.ts at a real implementation to get a live link.",
  )

  return flags
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
      flags: flagsFor(run),
    },
  }
}

function newRunId(): string {
  return `run_${globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`
}

export const mockRunner: IntroMeetingRunner = {
  async suggestCohorts(query: string) {
    const needle = query.trim().toUpperCase()
    if (needle.length === 0) return []

    const matches: CohortSuggestion[] = PLANNA_SNAPSHOT.filter(
      (cohort) =>
        cohort.code.includes(needle) ||
        cohort.courseTitle.toUpperCase().includes(needle),
    )
      // Codes that start with what was typed are the likelier intent.
      .sort((a, b) => {
        const aStarts = a.code.startsWith(needle) ? 0 : 1
        const bStarts = b.code.startsWith(needle) ? 0 : 1
        return aStarts - bStarts || a.code.localeCompare(b.code)
      })
      .slice(0, 8)
      .map((cohort) => ({ cohortCode: cohort.code, courseTitle: cohort.courseTitle }))

    return matches
  },

  async listColorSchemes() {
    // Every pair that has a template. A real runner may narrow this to the
    // distinct `color_scheme` values Planna actually holds, but must not go
    // below them — a cohort can always be given a pair Planna has not used yet.
    return [...COLOR_SCHEMES]
  },

  async start(request: RunRequest) {
    const cohortCode = request.cohortCode.trim().toUpperCase()
    const runId = newRunId()
    const startedAt = Date.now()
    const known = findCohort(cohortCode)
    const seeded =
      known?.colorScheme && isColorScheme(known.colorScheme) ? known.colorScheme : null

    const run: MockRun = {
      cohortCode,
      courseTitle: known?.courseTitle ?? cohortCode,
      requestedBy: request.requestedBy,
      startedAt,
      scheme: seeded,
      schemeSource: seeded ? "planna" : "user",
      resumedAt: seeded ? startedAt + DISCOVERY_MS : null,
      failure: known
        ? null
        : `No cohort named ${cohortCode} in Planna Cotta. Check the code and try again.`,
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
