import { runner } from "@/lib/runner"
import { currentUserEmail } from "@/lib/session"

/** Cohort-code typeahead. `?q=` is what the user has typed so far. */
export async function GET(request: Request) {
  if (!(await currentUserEmail())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const query = new URL(request.url).searchParams.get("q") ?? ""
  // Long input is a paste, not a search — no point asking Planna.
  if (query.trim().length === 0 || query.length > 24) {
    return Response.json({ suggestions: [] })
  }

  return Response.json({ suggestions: await runner.suggestCohorts(query) })
}
