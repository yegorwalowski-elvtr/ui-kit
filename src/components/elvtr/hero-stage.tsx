"use client"

// Holds React state, so it declares a client boundary for React Server
// Component consumers (Next.js). Inert for bundlers that do not use RSC.
import * as React from "react"

import { cn } from "../../lib/utils"

/*
 * ELVTR HeroStage — the full-viewport page shell of the Cola Orange screens
 * (Core Brand Guides 2.0, "Intro Meeting UI", frames 5709:5198 / 5715:6596 /
 * 5721:2 / 5725:11407): Mauve ground, a single levitating hero object, and a
 * centred copy + action column under it.
 *
 * Figma geometry (desktop ceilings — the mockups are 1440x1024 only, so the
 * paddings and gaps clamp down on shorter/narrower viewports instead of
 * overflowing): 56px vertical page padding, 120px side padding on the
 * column, 65px between hero / copy / actions, 35px inside the copy group,
 * 20px inside the action row, hero box 733.33 x 400 (object-cover).
 *
 * The hero box is `aspect-[733/400]` on purpose, not a width clamp paired
 * with a separate vh-based height clamp. Those two used to drift apart on
 * anything shorter than a ~1250px-tall window — which is most real desktop
 * browsers, 1440x1024 included — so the box stopped matching the art's own
 * 1.833 ratio and `object-cover` quietly cropped far more than Figma ever
 * shows. Locking the ratio means the box can only ever shrink, never
 * distort; a short window scrolls a little instead, which is the smaller
 * cost by far.
 *
 * Every frame in the file is one centred column, so there is no layout
 * variant — earlier revisions had a top/bottom split and no longer do.
 */

/** Honours the OS "reduce motion" setting; SSR-safe (starts false). */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  return reduced
}

export interface HeroVideoSources {
  /**
   * VP9- or AV1-with-alpha WebM. Transparency works in Chrome, Edge and
   * Firefox. Safari will happily PLAY this file and render the transparent
   * area BLACK — which is why `animated` takes priority over `video`.
   */
  webm?: string
  /**
   * HEVC-with-alpha in an .mp4 or .mov container — Safari only, and the only
   * transparent video Safari renders correctly. Produced by Apple tooling
   * (After Effects/Motion/Compressor on a Mac); libx265 cannot write alpha.
   */
  hevc?: string
}

export interface HeroStageProps extends React.ComponentProps<"main"> {
  /**
   * Hero artwork — a levitating object on a transparent canvas. Also the
   * poster and the fallback whenever `video` cannot play, so it is required
   * even when a video is supplied.
   */
  image: string
  /**
   * Optional transparent-video versions of the same object. Supply BOTH keys
   * for full coverage: no single codec plays everywhere (see HeroVideoSources).
   * The poster shows while it loads, if no source is playable, or when the
   * viewer asked for reduced motion.
   *
   * Ignored when `animated` is set.
   */
  video?: HeroVideoSources
  /**
   * An animated image with alpha — animated WebP (or APNG) — rendered as
   * `<img>`. Every current browser animates it with transparency intact,
   * including Safari, so this is the one-file way to move a transparent hero
   * without an Apple-only HEVC encode.
   *
   * Takes priority over `video`: given both, Safari would pick the WebM and
   * paint the transparency black.
   */
  animated?: string
  /**
   * Empty by default: the hero is decorative and the heading carries the
   * meaning. Pass a string only when the object itself is information.
   */
  imageAlt?: string
  /**
   * `cover` (default) fills the Figma box on md and up, as the mockups do, but
   * falls back to `contain` on phone widths — the box gets much narrower there
   * and cover would slice the hero object's sides off. `contain` letterboxes
   * at every width.
   */
  imageFit?: "cover" | "contain"
  /** Pinned top-right, clear of the centred column — e.g. an `AccountChip`. */
  topBar?: React.ReactNode
}

function HeroStage({
  image,
  video,
  animated,
  imageAlt = "",
  imageFit = "cover",
  topBar,
  className,
  children,
  ...props
}: HeroStageProps) {
  const reducedMotion = usePrefersReducedMotion()
  const playAnimation = Boolean(animated) && !reducedMotion
  const playVideo = !playAnimation && Boolean(video?.webm || video?.hevc) && !reducedMotion
  const fitClass =
    imageFit === "cover" ? "object-contain md:object-cover" : "object-contain"

  return (
    <main
      data-slot="hero-stage"
      className={cn(
        "relative flex min-h-svh w-full flex-col items-center justify-center",
        "bg-elvtr-mauve py-[clamp(24px,5vh,56px)] text-elvtr-dark",
        className
      )}
      {...props}
    >
      {topBar ? (
        <div className="absolute top-[clamp(16px,4vh,41px)] right-0 z-10 flex justify-end px-[clamp(16px,4vw,50px)]">
          {topBar}
        </div>
      ) : null}

      <div className="flex w-full flex-col items-center gap-[clamp(28px,5vh,65px)] px-6 md:px-[120px]">
        <div
          data-slot="hero-stage-image"
          className="relative w-full max-w-[733px] aspect-[733/400] shrink-0"
        >
          {playAnimation ? (
            <img
              src={animated}
              alt={imageAlt}
              aria-hidden={imageAlt === "" ? true : undefined}
              className={cn("pointer-events-none size-full select-none", fitClass)}
            />
          ) : playVideo ? (
            <video
              key={`${video?.webm ?? ""}|${video?.hevc ?? ""}`}
              poster={image}
              autoPlay
              muted
              loop
              playsInline
              // Decorative: never in the tab order, never announced.
              aria-hidden
              tabIndex={-1}
              className={cn("pointer-events-none size-full select-none", fitClass)}
            >
              {video?.webm ? <source src={video.webm} type="video/webm" /> : null}
              {/* Safari matches on the codec string, not the extension. */}
              {video?.hevc ? (
                <source src={video.hevc} type='video/mp4; codecs="hvc1"' />
              ) : null}
            </video>
          ) : (
            <img
              src={image}
              alt={imageAlt}
              aria-hidden={imageAlt === "" ? true : undefined}
              className={cn("pointer-events-none size-full select-none", fitClass)}
            />
          )}
        </div>
        {children}
      </div>
    </main>
  )
}

/**
 * The copy group inside a `HeroStage` — heading, supporting line and the
 * field(s) that belong with them, 35px apart per Figma.
 */
function HeroStageCopy({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-stage-copy"
      className={cn(
        "flex w-full flex-col items-center gap-[clamp(20px,3vh,35px)] text-center",
        className
      )}
      {...props}
    />
  )
}

/** The action row under the copy group — CTA plus any secondary link. */
function HeroStageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-stage-actions"
      className={cn("flex w-full flex-col items-center gap-[20px]", className)}
      {...props}
    />
  )
}

export { HeroStage, HeroStageActions, HeroStageCopy }
