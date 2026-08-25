import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/*
 * ELVTR HeroStage — the full-viewport page shell of the Cola Orange screens
 * (Core Brand Guides 2.0, "Intro Meeting UI", frames 5709:5198 / 5715:6596 /
 * 5715:6619): mauve ground, a single levitating 3D hero object up top and a
 * centred copy + action block below.
 *
 * Figma geometry: 1440x1024 frame, 56px vertical padding, 120px side padding
 * on the copy block, hero image box 913.14 x 498.08 (object-cover), 65px
 * between the copy group and the action row. Those are the DESKTOP ceilings —
 * the mockups are 1440-only, so the paddings, gaps and hero height clamp down
 * on shorter and narrower viewports instead of overflowing.
 *
 *   layout="split"  — hero pinned top, copy block pinned bottom (screens 1, 6)
 *   layout="center" — hero and copy centred as one group, 50px gap (screen 7)
 */

const stageVariants = cva(
  "flex min-h-svh w-full flex-col items-center bg-elvtr-mauve py-[clamp(24px,5vh,56px)] text-elvtr-dark",
  {
    variants: {
      layout: {
        split: "justify-between",
        center: "justify-center gap-[clamp(24px,4vh,50px)]",
      },
    },
    defaultVariants: {
      layout: "split",
    },
  }
)

export interface HeroStageProps
  extends React.ComponentProps<"main">,
    VariantProps<typeof stageVariants> {
  /** Hero artwork source — a levitating 3D object on a transparent canvas. */
  image: string
  /**
   * Empty by default: the hero is decorative, the heading carries the meaning.
   * Pass a string only when the object itself is information.
   */
  imageAlt?: string
  /**
   * `cover` (default) fills the 913x498 Figma box — right for the wide
   * renders. `contain` letterboxes inside it — right for a square 3D icon
   * (200x200 library component) reused as a hero.
   */
  imageFit?: "cover" | "contain"
}

function HeroStage({
  image,
  imageAlt = "",
  imageFit = "cover",
  layout,
  className,
  children,
  ...props
}: HeroStageProps) {
  return (
    <main
      data-slot="hero-stage"
      className={cn(stageVariants({ layout }), className)}
      {...props}
    >
      <div
        data-slot="hero-stage-image"
        className="relative h-[clamp(180px,34vh,498px)] w-full max-w-[913px] shrink-0 px-6"
      >
        <img
          src={image}
          alt={imageAlt}
          aria-hidden={imageAlt === "" ? true : undefined}
          className={cn(
            "pointer-events-none size-full select-none",
            imageFit === "cover" ? "object-cover" : "object-contain"
          )}
        />
      </div>
      <div
        data-slot="hero-stage-body"
        className="flex w-full shrink-0 flex-col items-center gap-[clamp(28px,5vh,65px)] px-6 md:px-[120px]"
      >
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

export { HeroStage, HeroStageActions, HeroStageCopy, stageVariants }
