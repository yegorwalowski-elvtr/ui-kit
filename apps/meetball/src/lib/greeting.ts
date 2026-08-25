/**
 * "Good {Part Of The Day}" per the Figma copy (node 5709:5245).
 * Computed from the viewer's own clock, so it has to run client-side.
 */
export function partOfDay(now: Date): "morning" | "afternoon" | "evening" {
  const hour = now.getHours()
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}

/** "sabina.rodriguez@elvtr.com" -> "Sabina" — a usable fallback when Google gives no name. */
export function firstNameFrom(name: string | null | undefined, email: string | null | undefined) {
  const fromName = name?.trim().split(/\s+/)[0]
  if (fromName) return fromName

  const local = email?.split("@")[0]
  if (!local) return null

  const first = local.split(/[._-]/)[0]
  if (!first) return null

  return first.charAt(0).toUpperCase() + first.slice(1)
}
