import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/*
 * ELVTR brand type styles (Figma):
 *   Display/headings — "ABC Arizona Flare" 500, tight tracking.
 *     Confirmed from Figma: H1 34px/1.0 with -1px letter-spacing,
 *     hero up to 200px/0.9, tile headers 22px.
 *     h2/h4 sizes are interpolated from that scale — adjust once the
 *     full Figma type ramp is tokenized.
 *   UI/body — "Neue Montreal" 500, 1.2 line-height.
 *     Confirmed from Figma: P2 16px/1.2. p1/caption are interpolated.
 */

const headingVariants = cva("font-display font-medium text-primary", {
  variants: {
    level: {
      /** Oversized hero display — up to 200px, 0.9 leading (Figma hero). */
      hero: "text-[clamp(56px,10vw,200px)] leading-[0.9] tracking-[-0.02em] text-balance",
      /**
       * Screen title — 60px / 1.0, tracking -2.4px. From Core Brand Guides
       * 2.0, "Intro Meeting UI" (e.g. node 5709:5245). Steps down on narrow
       * viewports; the Figma value is the ceiling.
       */
      display: "text-[clamp(34px,5.2vw,60px)] leading-none tracking-[-0.04em] text-balance",
      /** Figma H1: 34px / 1.0, letter-spacing -1px. */
      h1: "text-[34px] leading-none tracking-[-1px]",
      /* Interpolated step (not yet a Figma token) */
      h2: "text-[28px] leading-[1.05] tracking-[-0.8px]",
      /** 22px — matches the "Session Details" tile header in Figma. */
      h3: "text-[22px] leading-[1.1] tracking-[-0.6px]",
      /* Interpolated step (not yet a Figma token) */
      h4: "text-[18px] leading-[1.15] tracking-[-0.4px]",
    },
  },
  defaultVariants: {
    level: "h1",
  },
})

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span"

export interface HeadingProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headingVariants> {
  /** Rendered element. Defaults to the semantic tag for the level (hero → h1). */
  as?: HeadingElement
}

function Heading({ level = "h1", as, className, ...props }: HeadingProps) {
  const Comp: HeadingElement =
    as ?? (level === "hero" || level === "display" || level == null ? "h1" : level)
  return (
    <Comp
      data-slot="heading"
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  )
}

const textVariants = cva("font-sans font-medium", {
  variants: {
    variant: {
      /**
       * 30px / 1.2 — the supporting line under a `display` heading in Core
       * Brand Guides 2.0, "Intro Meeting UI" (e.g. node 5709:5246).
       */
      lead: "text-[clamp(18px,2.4vw,30px)] leading-[1.2]",
      /* Interpolated step (not yet a Figma token) */
      p1: "text-[18px] leading-[1.25]",
      /** Figma P2: 16px / 1.2 — the default body style. */
      p2: "text-[16px] leading-[1.2]",
      /* Interpolated step (not yet a Figma token) */
      caption: "text-[13px] leading-[1.2] text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p2",
  },
})

type TextElement = "p" | "span" | "div" | "li" | "label" | "figcaption"

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  /** Rendered element. Defaults to `p`. */
  as?: TextElement
}

function Text({ variant, as, className, ...props }: TextProps) {
  const Comp: TextElement = as ?? "p"
  return (
    <Comp
      data-slot="text"
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Heading, headingVariants, Text, textVariants }
