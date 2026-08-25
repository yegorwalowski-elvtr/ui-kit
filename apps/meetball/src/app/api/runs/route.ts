import { parseCohortCode } from "@/lib/cohort-code"
import { runner } from "@/lib/runner"
import { currentUserEmail } from "@/lib/session"

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error"
}

/**
 * Starts a run. `src/proxy.ts` already requires a signed-in @elvtr.com session
 * here; the check is repeated so the handler is safe on its own if the matcher
 * ever changes.
 */
export async function POST(request: Request) {
  const email = await currentUserEmail()
  if (!email) return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 })
  }

  const code = parseCohortCode((body as { cohortCode?: unknown } | null)?.cohortCode)
  if (!code.ok) return Response.json({ error: code.error }, { status: 400 })

  try {
    const { runId, state } = await runner.start({
      cohortCode: code.value,
      requestedBy: email,
    })
    return Response.json({ runId, state }, { status: 201 })
  } catch (error) {
    // The live runner talks to Managed Agents, so a wrong agent id, a missing
    // key or a network blip lands here. Pass the reason through: an
    // unexplained 500 on the first configured run is the worst possible time
    // to be vague.
    return Response.json(
      { error: `Could not start the run: ${messageOf(error)}` },
      { status: 502 },
    )
  }
}
