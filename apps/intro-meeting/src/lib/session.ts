import { auth } from "@/auth"

/**
 * The e-mail the run belongs to.
 *
 * `src/proxy.ts` is what actually gates these routes, and the two preview
 * switches turn that gate off — so the route handlers have to honour the same
 * switches, otherwise a preview host serves pages that its own API rejects.
 * Outside preview mode this stays a real second check: no session, no run.
 */
const PREVIEW_USER = "preview@elvtr.com"

function previewMode() {
  return (
    process.env.INTRO_MEETING_PUBLIC_PREVIEW === "1" ||
    process.env.INTRO_MEETING_LOCAL_PREVIEW === "1"
  )
}

export async function currentUserEmail(): Promise<string | null> {
  const session = await auth()
  const email = session?.user?.email
  if (email) return email

  return previewMode() ? PREVIEW_USER : null
}
