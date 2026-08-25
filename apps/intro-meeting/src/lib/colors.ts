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
 * Planna Cotta does NOT carry these: a cohort's `color_scheme` is a bare slug
 * (`purple_turquoise`) and the only hex Planna has is `market.color` — the
 * market brand colour, which the skill explicitly says is not the deck colour.
 * Figma has no variable set with these eight names either; its Brand Colors
 * collection is five Latent/Signal/Diffuse palettes.
 *
 * So each dot is mapped onto the nearest published ELVTR brand value, sourced
 * below. THIS TABLE IS THE ONLY PLACE TO CORRECT THEM — the dots are cosmetic,
 * the slug sent to the skill is what actually picks the Gamma template.
 * TODO confirm all eight with Design Team.
 */
const SWATCHES: Record<ColorBase | ColorAccent, string> = {
  // Bases are the dark half of a pair -> the palettes' Latent values.
  blue: "#03194A", // Figma variable Brand Colors / Ice Ink / Latent
  green: "#004A4A", // ui-kit --elvtr-dark-teal (the Green-Lime palette's dark)
  purple: "#2B0C4A", // Figma variable Brand Colors / Purple Haze / Latent
  white: "#FFFFFF", // no brand variable — plain white
  // Accents are the bright half -> the palettes' Signal values.
  lime: "#C8FF68", // ui-kit --elvtr-lime (Diamond Pine Signal #00FF85 reads green, not lime)
  turquoise: "#00D5FF", // Figma variable Brand Colors / Ice Ink / Signal
  pink: "#FF2E93", // Figma variable Brand Colors / Sour Cherry / Signal
  light_blue: "#EBF9FF", // Figma variable Brand Colors / Ice Ink / Diffuse
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
