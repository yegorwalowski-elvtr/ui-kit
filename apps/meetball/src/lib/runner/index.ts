import { agentRunner } from "./agent"
import { anthropicTransport } from "./agent-transport"
import { mockRunner } from "./mock"
import type { IntroMeetingRunner } from "./types"

/*
 * Which runner serves a request.
 *
 * The agent runner needs a provisioned Managed Agent — run
 * `node scripts/setup-agent.mjs` once and put the three ids it prints into the
 * environment. Until all three are set, the mock serves, so a deploy without
 * them is a working demo rather than a broken tool.
 *
 * Server-side only. A real run holds the Anthropic key and the Planna / Figma /
 * Gamma credentials; none of that may be reachable from the browser.
 */

function configuredAgentRunner(): IntroMeetingRunner | null {
  const agentId = process.env.MEETBALL_AGENT_ID
  const environmentId = process.env.MEETBALL_ENVIRONMENT_ID
  if (!agentId || !environmentId) return null

  return agentRunner(
    anthropicTransport({
      agentId,
      environmentId,
      // Comma-separated so several vaults can be attached without a code change.
      vaultIds: (process.env.MEETBALL_VAULT_IDS ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    }),
  )
}

export const runner: IntroMeetingRunner = configuredAgentRunner() ?? mockRunner

/** True when real decks are being built — used by the API to label a run. */
export const runnerIsLive = runner !== mockRunner

export type {
  CohortSuggestion,
  CohortSummary,
  IntroMeetingRunner,
  RunRequest,
  RunResult,
  RunState,
} from "./types"
