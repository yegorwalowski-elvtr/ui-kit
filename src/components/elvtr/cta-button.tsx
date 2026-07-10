import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"

/*
 * ELVTR CtaButton — the full-width Dark Teal bar with light text used for
 * primary calls to action ("Join Google Classroom" in the Student Care
 * email). Fully-rounded pill per the brand radius rules.
 */

export interface CtaButtonProps extends React.ComponentProps<"button"> {
  /** Render the child element instead (e.g. an <a>), keeping the CTA styles. */
  asChild?: boolean
}

function CtaButton({ className, asChild = false, ...props }: CtaButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="cta-button"
      className={cn(
        "inline-flex h-14 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-8 text-center font-sans text-base font-medium whitespace-nowrap text-primary-foreground transition-colors outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

export { CtaButton }
