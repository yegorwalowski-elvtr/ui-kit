/*
 * The ELVTR Intro Meeting colour pairs.
 *
 * Source of truth: the `creative-gamma-intro-meetings` skill, Step 2 — a
 * cohort's Planna Cotta `color_scheme` slug (`purple_turquoise`, …) selects the
 * colour-matched Gamma template. Exactly nine pairs have a template, which is
 * why this is an explicit list and not base x accent:
 *
 *   - Purple + Pink has no template.
 *   - White pairs ONLY with Light Blue, and Light Blue ONLY with White.
 *
 * The pair -> template-id map deliberately does NOT live here: the skill
 * re-queries Gamma for the current template ids on every run, because template
 * titles get renamed in place.
 */

export const COLOR_BASES = ["blue", "green", "purple", "white"] as const
export const COLOR_ACCENTS = ["lime", "turquoise", "pink", "light_blue"] as const

export type ColorBase = (typeof COLOR_BASES)[number]
export type ColorAccent = (typeof COLOR_ACCENTS)[number]

/** The nine pairs that have an Intro Meeting template, as Planna slugs. */
export const COLOR_SCHEMES = [
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

export type ColorScheme = (typeof COLOR_SCHEMES)[number]

const LABELS: Record<ColorBase | ColorAccent, string> = {
  blue: "Blue",
  green: "Green",
  purple: "Purple",
  white: "White",
  lime: "Lime",
  turquoise: "Turquoise",
  pink: "Pink",
  light_blue: "Light Blue",
}

export function colorLabel(value: ColorBase | ColorAccent): string {
  return LABELS[value]
}

export function toScheme(base: ColorBase, accent: ColorAccent): string {
  return `${base}_${accent}`
}

export function isColorScheme(value: string): value is ColorScheme {
  return (COLOR_SCHEMES as readonly string[]).includes(value)
}

/** "purple_turquoise" -> "Purple + Turquoise" — how the skill names the pair. */
export function schemeLabel(scheme: ColorScheme): string {
  const accent = COLOR_ACCENTS.find((candidate) => scheme.endsWith(`_${candidate}`))!
  const base = scheme.slice(0, -(accent.length + 1)) as ColorBase
  return `${colorLabel(base)} + ${colorLabel(accent)}`
}

/** Accents that form a real pair with `base` — everything else has no template. */
export function accentsFor(base: ColorBase | ""): readonly ColorAccent[] {
  if (base === "") return COLOR_ACCENTS
  return COLOR_ACCENTS.filter((accent) => isColorScheme(toScheme(base, accent)))
}

/** Bases that form a real pair with `accent`. */
export function basesFor(accent: ColorAccent | ""): readonly ColorBase[] {
  if (accent === "") return COLOR_BASES
  return COLOR_BASES.filter((base) => isColorScheme(toScheme(base, accent)))
}
