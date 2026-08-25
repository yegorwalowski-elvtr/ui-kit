import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"

/*
 * ELVTR ColaButton — the primary action button of the Cola Orange screens
 * (Core Brand Guides 2.0, "Intro Meeting UI", node 5712:6530): Cola Orange
 * Latent ground, Cola Orange Signal ink, 12px radius, ABC Arizona Flare 24px,
 * 32/16 padding.
 *
 * Brand rule: Signal ink belongs on Latent ground. Never put Signal text
 * straight onto the mauve page ground, and never light text on Signal.
 *
 * For the Green-Lime surface (Dark Teal pill, full-width bar) use `CtaButton`.
 */

export interface ColaButtonProps extends React.ComponentProps<"button"> {
  /** Render the child element instead (e.g. an `<a>`), keeping the styles. */
  asChild?: boolean
}

function ColaButton({ className, asChild = false, ...props }: ColaButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="cola-button"
      className={cn(
        "inline-flex h-[56px] w-fit shrink-0 cursor-pointer items-center justify-center gap-2",
        "rounded-[12px] bg-elvtr-cola-latent px-[32px]",
        "font-display text-[24px] leading-none font-medium tracking-[-0.03em] whitespace-nowrap text-elvtr-cola-signal",
        "transition-opacity outline-none hover:opacity-90",
        "focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

export { ColaButton }
