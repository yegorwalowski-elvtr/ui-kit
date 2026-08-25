import { readdirSync } from "node:fs"
import { join } from "node:path"

import type { HeroVideoSources } from "@elvtr/ui-kit"

/*
 * Resolves each screen's hero from what is actually sitting in public/hero/,
 * so swapping a still for a video is a matter of dropping the file in — no code
 * change, no rebuild.
 *
 * Per hero name, the still (`<name>.png`) is always the poster and the fallback.
 * On top of it, in priority order:
 *   <name>.webp         -> animated WebP with alpha: works in EVERY current
 *                          browser, Safari included, and needs no Apple tooling
 *   <name>.webm         -> Chrome, Edge, Firefox (VP9/AV1 with alpha)
 *   <name>.mp4 / .mov   -> Safari (HEVC with alpha)
 *
 * Server-only (it reads the filesystem). Client components take the result as
 * a prop.
 */

export type HeroName = "greeting" | "login" | "colors" | "done" | "door"

export interface HeroMedia {
  image: string
  video?: HeroVideoSources
  animated?: string
}

export type HeroMediaMap = Record<HeroName, HeroMedia>

const HERO_NAMES: readonly HeroName[] = ["greeting", "login", "colors", "done", "door"]

/** Read fresh each call — one readdir, and a dropped file shows up right away. */
function present(): Set<string> {
  try {
    return new Set(readdirSync(join(process.cwd(), "public", "hero")))
  } catch {
    return new Set()
  }
}

export function heroMedia(): HeroMediaMap {
  const files = present()

  const entries = HERO_NAMES.map((name) => {
    // An animated WebP wins: Safari plays a WebM but paints its alpha black.
    const animated = files.has(`${name}.webp`) ? `/hero/${name}.webp` : undefined
    const webm = files.has(`${name}.webm`) ? `/hero/${name}.webm` : undefined
    // Safari matches on the codec, not the container, so either extension works.
    const hevcFile = [`${name}.mp4`, `${name}.mov`].find((file) => files.has(file))
    const hevc = hevcFile ? `/hero/${hevcFile}` : undefined

    return [
      name,
      {
        image: `/hero/${name}.png`,
        ...(animated ? { animated } : null),
        ...(webm || hevc ? { video: { webm, hevc } } : null),
      },
    ] as const
  })

  return Object.fromEntries(entries) as HeroMediaMap
}
