import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"

/*
 * ELVTR SecondaryLink — the underlined "Create Another" action of Core Brand
 * Guides 2.0, "Intro Meeting UI" (node 5715:6639): Neue Montreal Medium
 * 20px/1.2, Dark at 50% opacity, underlined. Sits beside a ColaButton in
 * HeroStageActions as the lower-emphasis of the two actions on a done screen.
 */

export interface SecondaryLinkProps extends React.ComponentProps<"button"> {
  /** Render the child element instead (e.g. an `<a>`), keeping the styles. */
  asChild?: boolean
}

function SecondaryLink({ className, asChild = false, ...props }: SecondaryLinkProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="secondary-link"
      className={cn(
        "cursor-pointer font-sans text-[20px] leading-[1.2] font-medium text-elvtr-dark/50",
        "underline decoration-solid underline-offset-2 outline-none",
        "hover:text-elvtr-dark/70",
        "focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40",
        className
      )}
      {...props}
    />
  )
}

export { SecondaryLink }
