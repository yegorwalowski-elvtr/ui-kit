import { mockRunner } from "./mock"
import type { IntroMeetingRunner } from "./types"

/*
 * Swap point for the real thing.
 *
 * The mock is the only implementation today. To go live, add a module that
 * satisfies `IntroMeetingRunner` (see ./types.ts) — it has to run the
 * `creative-gamma-intro-meetings` skill with the cohort code, relay the
 * colour-pair question when Planna Cotta has no `color_scheme`, and return the
 * Gamma URL plus the skill's flags — then select it here.
 *
 * Keep the selection server-side: a real runner holds Planna / Figma / Gamma
 * credentials and must never be reachable from the browser.
 */
export const runner: IntroMeetingRunner = mockRunner

export type {
  CohortSummary,
  IntroMeetingRunner,
  RunRequest,
  RunResult,
  RunState,
} from "./types"
