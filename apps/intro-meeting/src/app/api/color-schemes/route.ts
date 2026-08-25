import { isColorScheme } from "@/lib/colors"
import { runner } from "@/lib/runner"
import { currentUserEmail } from "@/lib/session"

/**
 * The colour pairs offered on the fallback screen, in Planna's slug form.
 * Anything the runner reports that this app has no template for is dropped
 * rather than shown as an option that cannot be built.
 */
export async function GET() {
  if (!(await currentUserEmail())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const schemes = (await runner.listColorSchemes()).filter(isColorScheme)
  return Response.json({ schemes })
}
