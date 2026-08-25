import { auth } from "@/auth"

/**
 * The e-mail the run belongs to.
 *
 * `src/proxy.ts` is what gates these routes, and the preview switches turn that
 * gate off — so the handlers honour the same switches, otherwise a preview host
 * would serve pages its own API rejects. The rule is kept identical to the
 * proxy's on purpose, including that a local preview only counts outside a
 * production build. Outside preview this stays a real second check: no session,
 * no run.
 */
const PREVIEW_USER = "preview@elvtr.com"

function previewMode() {
  return (
    process.env.MEETBALL_PUBLIC_PREVIEW === "1" ||
    (process.env.MEETBALL_LOCAL_PREVIEW === "1" && process.env.NODE_ENV !== "production")
  )
}

export async function currentUserEmail(): Promise<string | null> {
  const session = await auth()
  const email = session?.user?.email
  if (email) return email

  return previewMode() ? PREVIEW_USER : null
}
