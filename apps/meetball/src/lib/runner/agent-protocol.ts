/*
 * The contract between Meetball and the Managed Agent that runs the
 * `creative-gamma-intro-meetings` skill.
 *
 * Both halves import this file: `scripts/setup-agent.mjs` uses it to declare
 * the agent's custom tools, and `agent.ts` uses it to recognise the calls the
 * agent makes. Keeping the names and schemas in one place is what stops the
 * provisioning and the runtime from drifting apart.
 *
 * Two custom tools, and the reason each exists:
 *
 * - `request_color_pair` — the skill asks a human when Planna Cotta has no
 *   `color_scheme`. There is no human inside a Managed Agents session, so the
 *   agent asks Meetball instead: the call parks the session, Meetball shows the
 *   "Oops, No Colors Yet!" screen, and the answer comes back as the tool
 *   result. This is why the colour screen exists at all.
 *
 * - `report_result` — the deck URL has to come back as data, not as prose we
 *   regex out of the agent's last message. The agent must call this to finish.
 */

export const REQUEST_COLOR_PAIR_TOOL = "request_color_pair"
export const REPORT_RESULT_TOOL = "report_result"

/** The nine pairs that have a template, as Planna slugs. */
export const COLOR_SCHEME_SLUGS = [
  "blue_lime",
  "blue_turquoise",
  "blue_pink",
  "green_lime",
  "green_turquoise",
  "green_pink",
  "purple_lime",
  "purple_turquoise",
  "white_light_blue",
] as const

export const AGENT_CUSTOM_TOOLS = [
  {
    type: "custom" as const,
    name: REQUEST_COLOR_PAIR_TOOL,
    description:
      "Ask the operator which colour pair to build the deck on. Call this ONLY when the cohort's " +
      "Planna Cotta `color_scheme` is empty, null or unparseable — never when Planna already " +
      "answers it, and never to confirm a pair Planna gave you. Returns the chosen slug.",
    input_schema: {
      type: "object" as const,
      properties: {
        cohort_code: { type: "string", description: "The cohort's display name, e.g. UK-COO3." },
        course_title: {
          type: "string",
          description: "The course title from Planna, shown to the operator for context.",
        },
      },
      required: ["cohort_code", "course_title"],
      additionalProperties: false,
    },
  },
  {
    type: "custom" as const,
    name: REPORT_RESULT_TOOL,
    description:
      "Report the finished deck. Call this exactly once, as the last thing you do, after the " +
      "Gamma generation has completed and you have verified the deck. Do not summarise in prose " +
      "instead — this call is the only thing Meetball reads.",
    input_schema: {
      type: "object" as const,
      properties: {
        gamma_url: { type: "string", description: "URL of the generated Gamma deck." },
        color_pair: {
          type: "string",
          description: 'Human label of the pair used, e.g. "Purple + Turquoise".',
        },
        color_pair_source: {
          type: "string",
          enum: ["planna", "operator"],
          description: "Where the pair came from: Planna's color_scheme, or the operator's answer.",
        },
        flags: {
          type: "array",
          items: { type: "string" },
          description:
            "Everything you could not resolve and did not guess, one short sentence each — a " +
            "missing Discord or Google Classroom link, a program manager absent from the " +
            "directory, a course end date you could not confirm. Empty array if nothing.",
        },
      },
      required: ["gamma_url", "color_pair", "color_pair_source", "flags"],
      additionalProperties: false,
    },
  },
]

/** Shape of `report_result`'s input, once parsed. */
export interface ReportedResult {
  gamma_url: string
  color_pair: string
  color_pair_source: "planna" | "operator"
  flags: string[]
}

export const AGENT_SYSTEM_PROMPT = `You build ELVTR "Introduction Meeting" decks by following the
creative-gamma-intro-meetings skill exactly. The skill is the specification; read it and obey it,
including its rules about photo aspect ratios and about cleaning up temporary Figma frames.

You are running unattended, for an operator watching a progress screen. Two consequences:

1. There is no human to answer a pop-up. When the skill says to ask the user for the colour pair
   because Planna Cotta's color_scheme is empty, call the ${REQUEST_COLOR_PAIR_TOOL} tool instead.
   Do not guess a pair, and do not ask when Planna already has one.
2. Finish by calling ${REPORT_RESULT_TOOL} with the deck URL and every unresolved gap as a flag.
   Prose is not read by anything. If you cannot produce a deck, say why in plain text and stop —
   do not call ${REPORT_RESULT_TOOL} with a placeholder or invented URL.

Keep your visible messages to one short line per step; they are shown to the operator verbatim.`

/** Written into the session's opening message. */
export function buildRunPrompt(cohortCode: string, requestedBy: string): string {
  return [
    `Build the ELVTR Introduction Meeting deck for cohort ${cohortCode}.`,
    `Requested by ${requestedBy}.`,
    "",
    "Follow the creative-gamma-intro-meetings skill from the start: resolve the cohort in Planna",
    "Cotta, take the colour pair from its color_scheme field, and only call",
    `${REQUEST_COLOR_PAIR_TOOL} if that field is empty. Finish with ${REPORT_RESULT_TOOL}.`,
  ].join("\n")
}
