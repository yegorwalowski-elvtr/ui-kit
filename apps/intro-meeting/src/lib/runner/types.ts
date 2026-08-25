/*
 * The contract between this skin and whatever actually runs the
 * `creative-gamma-intro-meetings` skill.
 *
 * Today the only implementation is `mock.ts`. A real runner (a queue worker, a
 * Claude Agent SDK session, an HTTP call to an internal service) satisfies the
 * same interface and drops in via `src/lib/runner/index.ts` — no screen or
 * route handler changes.
 */

import type { ColorScheme } from "@/lib/colors"

export interface RunRequest {
  /** Cohort display name as typed by the user, e.g. "MDPM1", "UK-AIGD5". */
  cohortCode: string
  /** Signed-in @elvtr.com email — who asked for this deck. */
  requestedBy: string
}

/** What the skill resolved out of Planna Cotta, echoed back for confirmation. */
export interface CohortSummary {
  cohortCode: string
  courseTitle: string
  instructorName: string | null
  programManager: string | null
}

export interface RunResult {
  /** The finished Gamma deck. */
  gammaUrl: string
  /** Human label of the template used, e.g. "Purple + Turquoise". */
  colorPair: string
  /** Where the pair came from — the skill asks the user only as a fallback. */
  colorPairSource: "planna" | "user"
  /**
   * Things the operator must look at: a missing Google Classroom link, a PM
   * absent from the directory, an unconfirmed course end date. The skill
   * surfaces these instead of guessing, so the UI has to show them.
   */
  flags: string[]
}

export type RunState =
  /** Working. `step` is a short human line, safe to show verbatim. */
  | { status: "running"; step: string }
  /**
   * Planna Cotta has no `color_scheme` for this cohort (typical while a cohort
   * is still `planned`), so the user has to choose the pair.
   */
  | { status: "needs-colors"; cohort: CohortSummary }
  | { status: "done"; cohort: CohortSummary; result: RunResult }
  | { status: "failed"; error: string }

export interface IntroMeetingRunner {
  /** Begin a run. Returns its first state. */
  start(request: RunRequest): Promise<{ runId: string; state: RunState }>
  /** Current state of a run, or `null` when the id is unknown. */
  poll(runId: string): Promise<RunState | null>
  /** Answer the colour-pair question and let the run continue. */
  submitColors(runId: string, scheme: ColorScheme): Promise<RunState | null>
}
