import Anthropic from "@anthropic-ai/sdk"

/*
 * The slice of the Managed Agents API this runner uses, behind an interface.
 *
 * Two reasons it is not the SDK client directly: the orchestration in agent.ts
 * (progress mapping, parking on the colour question, resuming, extracting the
 * result) is the part most likely to be wrong, and this lets it be driven by a
 * scripted fake without an API key or a live session. It also keeps the SDK's
 * surface area in one file to re-check when the beta moves.
 */

/** Only the fields the runner reads. Everything else on an event is ignored. */
export interface SessionEvent {
  type: string
  id?: string
  name?: string
  input?: unknown
  content?: { type: string; text?: string }[]
  stop_reason?: string
  error?: { message?: string } | string
}

export interface AgentTransport {
  createSession(input: { title: string }): Promise<{ id: string }>
  sendUserMessage(sessionId: string, text: string): Promise<void>
  sendCustomToolResult(sessionId: string, toolUseId: string, text: string): Promise<void>
  streamEvents(sessionId: string): AsyncIterable<SessionEvent>
}

export interface AnthropicAgentConfig {
  /** From scripts/setup-agent.mjs. */
  agentId: string
  environmentId: string
  /** Holds the Planna / Figma / Gamma credentials; attaches at session create. */
  vaultIds: string[]
  apiKey?: string
}

/**
 * The real transport. Session creation takes a pointer to the pre-created
 * agent — model, system prompt, tools, MCP servers and skills all live on the
 * agent object, never here.
 */
/*
 * Turns an SDK error into one readable sentence. The raw message carries the
 * whole JSON body, which ends up in front of the operator on the failure
 * screen — "401 API key is invalid." is what they can act on, a serialized
 * error envelope is not.
 */
function readable(error: unknown): Error {
  if (error instanceof Anthropic.APIError) {
    const body = error.error as { error?: { message?: string } } | undefined
    const detail = body?.error?.message ?? error.message
    return new Error(`${error.status ?? "request failed"} ${detail}`)
  }
  return error instanceof Error ? error : new Error(String(error))
}

async function translating<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    throw readable(error)
  }
}

export function anthropicTransport(config: AnthropicAgentConfig): AgentTransport {
  const client = new Anthropic(config.apiKey ? { apiKey: config.apiKey } : {})

  return {
    async createSession({ title }) {
      const session = await translating(() =>
        client.beta.sessions.create({
        agent: config.agentId,
        environment_id: config.environmentId,
        ...(config.vaultIds.length > 0 ? { vault_ids: config.vaultIds } : null),
          title,
        }),
      )
      return { id: session.id }
    },

    async sendUserMessage(sessionId, text) {
      await translating(() =>
        client.beta.sessions.events.send(sessionId, {
          events: [{ type: "user.message", content: [{ type: "text", text }] }],
        }),
      )
    },

    async sendCustomToolResult(sessionId, toolUseId, text) {
      await translating(() =>
        client.beta.sessions.events.send(sessionId, {
          events: [
            {
              type: "user.custom_tool_result",
              custom_tool_use_id: toolUseId,
              content: [{ type: "text", text }],
            },
          ],
        }),
      )
    },

    async *streamEvents(sessionId) {
      const stream = await translating(() => client.beta.sessions.events.stream(sessionId))
      for await (const event of stream) {
        yield event as unknown as SessionEvent
      }
    },
  }
}
