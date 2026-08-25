import { isColorScheme } from "@/lib/colors"
import { runner } from "@/lib/runner"
import { currentUserEmail } from "@/lib/session"

type Params = { params: Promise<{ id: string }> }

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error"
}

/** Current state of a run. */
export async function GET(_request: Request, { params }: Params) {
  if (!(await currentUserEmail())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  try {
    const state = await runner.poll(id)
    if (!state) return Response.json({ error: "Unknown run." }, { status: 404 })
    return Response.json({ runId: id, state })
  } catch (error) {
    return Response.json({ error: messageOf(error) }, { status: 502 })
  }
}

/** Answers the colour-pair question and lets the run continue. */
export async function POST(request: Request, { params }: Params) {
  if (!(await currentUserEmail())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 })
  }

  const scheme = (body as { scheme?: unknown } | null)?.scheme
  if (typeof scheme !== "string" || !isColorScheme(scheme)) {
    return Response.json(
      { error: "That colour pair has no Intro Meeting template." },
      { status: 400 },
    )
  }

  try {
    const state = await runner.submitColors(id, scheme)
    if (!state) return Response.json({ error: "Unknown run." }, { status: 404 })
    return Response.json({ runId: id, state })
  } catch (error) {
    return Response.json(
      { error: `Could not send the colour pair: ${messageOf(error)}` },
      { status: 502 },
    )
  }
}
