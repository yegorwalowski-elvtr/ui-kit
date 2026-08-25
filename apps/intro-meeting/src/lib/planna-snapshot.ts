/*
 * A snapshot of real Planna Cotta cohorts, taken 2026-08-25 via
 * `list_cohorts(status="launched")`, used ONLY by the mock runner so the
 * suggestion list and the colour branch behave like the real thing:
 * most cohorts carry a `color_scheme`, a few genuinely do not (UK-COO3,
 * MDPM1) and those are the ones that must ask the user.
 *
 * A real runner queries Planna live and never reads this file.
 */

export interface SnapshotCohort {
  code: string
  courseTitle: string
  /** Planna's `color_scheme`, or null when the field is empty. */
  colorScheme: string | null
}

export const PLANNA_SNAPSHOT: readonly SnapshotCohort[] = [
  { code: "AIM9", courseTitle: "AI in Marketing", colorScheme: "green_turquoise" },
  { code: "MET1", courseTitle: "Become a Meteorologist Course", colorScheme: "blue_lime" },
  { code: "UK-AIMC1", courseTitle: "AI in Management Consulting", colorScheme: "green_turquoise" },
  { code: "BGP5", courseTitle: "Board Game Production", colorScheme: "blue_turquoise" },
  { code: "UK-MCG3", courseTitle: "Music Composition for Games", colorScheme: "blue_turquoise" },
  { code: "TDE1", courseTitle: "Tool Design Engineer Course", colorScheme: "green_turquoise" },
  { code: "UK-BIM3", courseTitle: "Building Information Modeling (BIM) Coordinator", colorScheme: "blue_turquoise" },
  { code: "3DPS1", courseTitle: "Become a 3D Printing Software Engineer Course", colorScheme: "purple_turquoise" },
  { code: "UK-TVD1", courseTitle: "Directing TV Drama Course", colorScheme: "blue_pink" },
  { code: "UK-COO3", courseTitle: "Chief Operating Officer (COO)", colorScheme: null },
  { code: "AIO1", courseTitle: "AI-Assisted OSINT Course", colorScheme: "green_turquoise" },
  { code: "AISC4", courseTitle: "AI in Supply Chain Management", colorScheme: "purple_lime" },
  { code: "UXG16", courseTitle: "UX/UI for Gaming", colorScheme: "purple_lime" },
  { code: "UK-DM1", courseTitle: "D&D Dungeon Master Course", colorScheme: "blue_lime" },
  { code: "UXGA3", courseTitle: "Advanced UX/UI for Gaming", colorScheme: "green_lime" },
  { code: "UK-CD7", courseTitle: "Become a Creative Director", colorScheme: "blue_lime" },
  { code: "UK-MLM2", courseTitle: "Music Licensing Manager", colorScheme: "purple_turquoise" },
  { code: "GD10", courseTitle: "Game Design with Unreal Engine 5", colorScheme: "purple_turquoise" },
  { code: "AIA5", courseTitle: "AI for Architects", colorScheme: "green_turquoise" },
  { code: "PMTV4", courseTitle: "Production Management in TV", colorScheme: "purple_lime" },
  { code: "UK-GW11", courseTitle: "Video Game Writing", colorScheme: "green_lime" },
  { code: "APAC-GW4", courseTitle: "Become a Game Writer", colorScheme: "blue_turquoise" },
  { code: "GWA2", courseTitle: "Advanced Game Writing", colorScheme: "blue_turquoise" },
  { code: "UK-TTD1", courseTitle: "Tattoo Designer Course", colorScheme: "purple_turquoise" },
  { code: "UK-BBE6", courseTitle: "Become a Book Editor", colorScheme: "blue_turquoise" },
  { code: "MDPM1", courseTitle: "Medical Device Product Management", colorScheme: null },
]
