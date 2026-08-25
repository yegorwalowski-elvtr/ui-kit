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

/*
 * Swatch hexes for the dropdown dots.
 *
 * Supplied by the ELVTR design team (2026-08-25) — and they had to be, because
 * nothing else holds them: a cohort's Planna Cotta `color_scheme` is a bare
 * slug (`purple_turquoise`), Planna's only hex is `market.color` (the market
 * brand colour, which the skill says is NOT the deck colour), and Figma's Brand
 * Colors collection is five Latent/Signal/Diffuse palettes under different
 * names. These are the Intro Meeting template palette specifically.
 *
 * The dots are cosmetic: the slug sent to the skill is what picks the Gamma
 * template. This table is the only place to correct them.
 */
const SWATCHES: Record<ColorBase | ColorAccent, string> = {
  // Bases — the deck's primary.
  blue: "#102E9C",
  green: "#025453",
  purple: "#58438A",
  // White + Light Blue is a single pair, and its two halves are the only
  // near-white values here — the dots keep a hairline ring so both still read
  // against the Cream field.
  white: "#F9F9F9",
  // Accents — the deck's secondary.
  lime: "#E5F744",
  turquoise: "#9BEEE7",
  pink: "#EDAEF9",
  light_blue: "#63ADF2",
}

/** Hex for a colour dot. Cosmetic only — see the note on SWATCHES. */
export function colorSwatch(value: ColorBase | ColorAccent): string {
  return SWATCHES[value]
}

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
  const { base, accent } = splitScheme(scheme)
  return `${colorLabel(base)} + ${colorLabel(accent)}`
}

/** Splits a scheme slug into its two halves. */
export function splitScheme(scheme: ColorScheme): { base: ColorBase; accent: ColorAccent } {
  // Longest accent first, so `light_blue` wins over a shorter suffix match.
  const accent = [...COLOR_ACCENTS]
    .sort((a, b) => b.length - a.length)
    .find((candidate) => scheme.endsWith(`_${candidate}`))!
  return { base: scheme.slice(0, -(accent.length + 1)) as ColorBase, accent }
}

/**
 * The two dropdowns are derived from the scheme list the server reports, not
 * from a list hardcoded in the UI — a pair added in Planna shows up on its own.
 * Each side is filtered by the other, so an impossible pair (Purple + Pink,
 * White + anything but Light Blue) can never be assembled.
 */
export function basesIn(
  schemes: readonly ColorScheme[],
  accent: ColorAccent | "" = ""
): ColorBase[] {
  const pairs = schemes.map(splitScheme)
  return COLOR_BASES.filter((base) =>
    pairs.some((pair) => pair.base === base && (accent === "" || pair.accent === accent))
  )
}

export function accentsIn(
  schemes: readonly ColorScheme[],
  base: ColorBase | "" = ""
): ColorAccent[] {
  const pairs = schemes.map(splitScheme)
  return COLOR_ACCENTS.filter((accent) =>
    pairs.some((pair) => pair.accent === accent && (base === "" || pair.base === base))
  )
}
