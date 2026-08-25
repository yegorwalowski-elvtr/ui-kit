/*
 * Drives the Managed Agents runner through every path with a scripted fake
 * transport — no API key, no live session, no cost.
 *
 * This covers the part of the runner that can actually be wrong: mapping the
 * event stream onto run states, parking on the colour question and resuming
 * from it, extracting the result, and failing loudly rather than hanging.
 * Whether the live API accepts the payloads is not in scope here; only a real
 * session proves that.
 *
 *   npm run test:runner --workspace @elvtr/meetball
 */

import assert from "node:assert/strict"

import { agentRunner } from "../src/lib/runner/agent"
import { REPORT_RESULT_TOOL, REQUEST_COLOR_PAIR_TOOL } from "../src/lib/runner/agent-protocol"
import type { AgentTransport, SessionEvent } from "../src/lib/runner/agent-transport"
import type { RunState } from "../src/lib/runner/types"

/** A transport that replays a scripted event list and records what was sent. */
function fakeTransport(script: SessionEvent[]) {
  const sent: { kind: string; body: string }[] = []
  let release: (() => void) | null = null
  const queue = [...script]

  const transport: AgentTransport = {
    async createSession() {
      return { id: "sesn_fake" }
    },
    async sendUserMessage(_id, text) {
      sent.push({ kind: "user.message", body: text })
    },
    async sendCustomToolResult(_id, toolUseId, text) {
      sent.push({ kind: `result:${toolUseId}`, body: text })
      release?.()
      release = null
    },
    async *streamEvents() {
      while (queue.length > 0) {
        const event = queue.shift()!
        // A parked tool call blocks the stream until the answer is sent, which
        // is exactly what the real session does.
        if (event.type === "__await_answer") {
          await new Promise<void>((resolve) => {
            release = resolve
          })
          continue
        }
        yield event
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    },
  }

  return { transport, sent }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 25))

async function pollUntil(
  runner: ReturnType<typeof agentRunner>,
  runId: string,
  predicate: (state: RunState) => boolean,
  label: string,
) {
  for (let i = 0; i < 200; i += 1) {
    const state = await runner.poll(runId)
    if (state && predicate(state)) return state
    await settle()
  }
  throw new Error(`timed out waiting for ${label}`)
}

let failures = 0
async function test(name: string, body: () => Promise<void>) {
  try {
    await body()
    console.log(`  ok   ${name}`)
  } catch (error) {
    failures += 1
    console.log(`  FAIL ${name}\n       ${error instanceof Error ? error.message : error}`)
  }
}

async function main() {
  console.log("agent runner")

  await test("Planna already has the pair: runs straight through to a deck", async () => {
    const { transport, sent } = fakeTransport([
      { type: "agent.mcp_tool_use", name: "list_cohorts" },
      { type: "agent.message", content: [{ type: "text", text: "Colour pair from Planna: purple_turquoise" }] },
      { type: "agent.mcp_tool_use", name: "generate_from_template" },
      {
        type: "agent.custom_tool_use",
        id: "sevt_result",
        name: REPORT_RESULT_TOOL,
        input: {
          gamma_url: "https://gamma.app/docs/abc123",
          color_pair: "Purple + Turquoise",
          color_pair_source: "planna",
          flags: ["No Discord link in Planna Cotta."],
        },
      },
      { type: "session.status_terminated" },
    ])

    const runner = agentRunner(transport)
    const { runId, state } = await runner.start({ cohortCode: "gd10", requestedBy: "a@elvtr.com" })
    assert.equal(state.status, "running")

    const done = await pollUntil(runner, runId, (s) => s.status === "done", "done")
    assert.equal(done.status, "done")
    if (done.status !== "done") return
    assert.equal(done.result.gammaUrl, "https://gamma.app/docs/abc123")
    assert.equal(done.result.colorPairSource, "planna")
    assert.deepEqual(done.result.flags, ["No Discord link in Planna Cotta."])
    assert.equal(done.cohort.cohortCode, "GD10", "cohort code is normalised to upper case")
    assert.ok(
      sent.some((entry) => entry.kind === "user.message" && entry.body.includes("GD10")),
      "the opening message names the cohort",
    )
    assert.ok(
      sent.some((entry) => entry.kind === "result:sevt_result"),
      "the result call is acknowledged so the session can wind down",
    )
  })

  await test("Planna has no pair: parks, then resumes on the answer", async () => {
    const { transport, sent } = fakeTransport([
      { type: "agent.mcp_tool_use", name: "list_cohorts" },
      {
        type: "agent.custom_tool_use",
        id: "sevt_ask",
        name: REQUEST_COLOR_PAIR_TOOL,
        input: { cohort_code: "UK-COO3", course_title: "Chief Operating Officer (COO)" },
      },
      { type: "__await_answer" },
      { type: "agent.mcp_tool_use", name: "generate_from_template" },
      {
        type: "agent.custom_tool_use",
        id: "sevt_result",
        name: REPORT_RESULT_TOOL,
        input: {
          gamma_url: "https://gamma.app/docs/xyz789",
          color_pair: "Green + Lime",
          color_pair_source: "operator",
          flags: [],
        },
      },
      { type: "session.status_terminated" },
    ])

    const runner = agentRunner(transport)
    const { runId } = await runner.start({ cohortCode: "UK-COO3", requestedBy: "a@elvtr.com" })

    const asked = await pollUntil(runner, runId, (s) => s.status === "needs-colors", "needs-colors")
    assert.equal(asked.status, "needs-colors")
    if (asked.status !== "needs-colors") return
    assert.equal(asked.cohort.courseTitle, "Chief Operating Officer (COO)")

    const resumed = await runner.submitColors(runId, "green_lime")
    assert.equal(resumed?.status, "running", "answering resumes the same session")
    assert.ok(
      sent.some((entry) => entry.kind === "result:sevt_ask" && entry.body === "green_lime"),
      "the answer goes back as the result of that exact tool call",
    )

    const done = await pollUntil(runner, runId, (s) => s.status === "done", "done")
    if (done.status !== "done") return
    assert.equal(done.result.colorPairSource, "user")
    assert.equal(done.result.gammaUrl, "https://gamma.app/docs/xyz789")
  })

  await test("a second answer is ignored rather than stalling the session", async () => {
    const { transport, sent } = fakeTransport([
      {
        type: "agent.custom_tool_use",
        id: "sevt_ask",
        name: REQUEST_COLOR_PAIR_TOOL,
        input: { cohort_code: "MDPM1", course_title: "Medical Device Product Management" },
      },
      { type: "__await_answer" },
    ])

    const runner = agentRunner(transport)
    const { runId } = await runner.start({ cohortCode: "MDPM1", requestedBy: "a@elvtr.com" })
    await pollUntil(runner, runId, (s) => s.status === "needs-colors", "needs-colors")

    await runner.submitColors(runId, "blue_lime")
    await runner.submitColors(runId, "green_pink")

    const answers = sent.filter((entry) => entry.kind === "result:sevt_ask")
    assert.equal(answers.length, 1, "only the first answer is sent")
    assert.equal(answers[0].body, "blue_lime")
  })

  await test("an invalid pair is refused without touching the session", async () => {
    const { transport, sent } = fakeTransport([
      {
        type: "agent.custom_tool_use",
        id: "sevt_ask",
        name: REQUEST_COLOR_PAIR_TOOL,
        input: { cohort_code: "MDPM1", course_title: "Medical Device Product Management" },
      },
      { type: "__await_answer" },
    ])

    const runner = agentRunner(transport)
    const { runId } = await runner.start({ cohortCode: "MDPM1", requestedBy: "a@elvtr.com" })
    await pollUntil(runner, runId, (s) => s.status === "needs-colors", "needs-colors")

    // purple_pink has no template.
    const refused = await runner.submitColors(runId, "purple_pink" as never)
    assert.equal(refused?.status, "failed")
    assert.equal(sent.filter((e) => e.kind === "result:sevt_ask").length, 0)
  })

  await test("a session that ends without reporting a result fails loudly", async () => {
    const { transport } = fakeTransport([
      { type: "agent.mcp_tool_use", name: "list_cohorts" },
      { type: "session.status_terminated" },
    ])

    const runner = agentRunner(transport)
    const { runId } = await runner.start({ cohortCode: "GD10", requestedBy: "a@elvtr.com" })
    const failed = await pollUntil(runner, runId, (s) => s.status === "failed", "failed")
    assert.equal(failed.status, "failed")
    if (failed.status !== "failed") return
    assert.match(failed.error, /without producing a deck/)
  })

  await test("a result with no deck link is a failure, not a done run", async () => {
    const { transport } = fakeTransport([
      {
        type: "agent.custom_tool_use",
        id: "sevt_result",
        name: REPORT_RESULT_TOOL,
        input: { gamma_url: "", color_pair: "Green + Lime", color_pair_source: "planna", flags: [] },
      },
      { type: "session.status_terminated" },
    ])

    const runner = agentRunner(transport)
    const { runId } = await runner.start({ cohortCode: "GD10", requestedBy: "a@elvtr.com" })
    const failed = await pollUntil(runner, runId, (s) => s.status === "failed", "failed")
    if (failed.status !== "failed") return
    assert.match(failed.error, /without a deck link/)
  })

  await test("session.error surfaces as the run's error", async () => {
    const { transport } = fakeTransport([
      { type: "session.error", error: { message: "MCP auth failed for Planna Cotta." } },
    ])

    const runner = agentRunner(transport)
    const { runId } = await runner.start({ cohortCode: "GD10", requestedBy: "a@elvtr.com" })
    const failed = await pollUntil(runner, runId, (s) => s.status === "failed", "failed")
    if (failed.status !== "failed") return
    assert.match(failed.error, /MCP auth failed/)
  })

  await test("tool calls become progress lines the UI can show verbatim", async () => {
    const { transport } = fakeTransport([
      { type: "agent.mcp_tool_use", name: "render_figma_image" },
      { type: "__await_answer" },
    ])

    const runner = agentRunner(transport)
    const { runId } = await runner.start({ cohortCode: "GD10", requestedBy: "a@elvtr.com" })
    const running = await pollUntil(
      runner,
      runId,
      (s) => s.status === "running" && s.step.includes("Figma"),
      "a Figma progress line",
    )
    assert.equal(running.status, "running")
  })

  await test("suggestions and schemes answer without starting a session", async () => {
    let created = 0
    const transport: AgentTransport = {
      async createSession() {
        created += 1
        return { id: "sesn_fake" }
      },
      async sendUserMessage() {},
      async sendCustomToolResult() {},
      async *streamEvents() {},
    }

    const runner = agentRunner(transport)
    const suggestions = await runner.suggestCohorts("UK-C")
    assert.deepEqual(
      suggestions.map((s) => s.cohortCode),
      ["UK-CD7", "UK-COO3"],
    )
    assert.equal((await runner.listColorSchemes()).length, 9)
    assert.equal(created, 0, "typeahead must never cost a model call")
  })

  console.log(failures === 0 ? "\nall passed" : `\n${failures} failed`)
  process.exit(failures === 0 ? 0 : 1)
}

void main()
