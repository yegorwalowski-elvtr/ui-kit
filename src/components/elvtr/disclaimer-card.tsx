import * as React from "react"

import { cn } from "../../lib/utils"
import { BrandIcon } from "./brand-icon"

/*
 * ELVTR DisclaimerCard — the Cream notice of "Intro Meeting UI" (node
 * 5722:4310): 20px radius, 30/20 padding, 25px gap, a 50px vuesax-bulk icon
 * and Neue Montreal 25px at -0.5px tracking.
 *
 * The card HUGS its text rather than spanning the column — the frame's card is
 * 1068 wide only because its placeholder line is, and short notices look
 * stranded in a full-width box. It still caps at the column width, where a
 * real (long) disclaimer wraps instead of overflowing.
 *
 * Used for the things a run could not resolve and must not guess — a missing
 * Discord or Google Classroom link, a program manager who is not in the
 * directory, an unconfirmed course end date.
 */

export interface DisclaimerCardProps extends React.ComponentProps<"div"> {
  /** Defaults to the `danger` brand icon. Pass a node to override. */
  icon?: React.ReactNode
}

function DisclaimerCard({ icon, className, children, ...props }: DisclaimerCardProps) {
  return (
    <div
      data-slot="disclaimer-card"
      className={cn(
        "flex items-center gap-[25px] rounded-[20px] bg-elvtr-cream px-[30px] py-[20px]",
        "w-fit max-w-full text-left font-sans text-[25px] leading-[1.2] font-medium tracking-[-0.02em] text-elvtr-dark",
        className
      )}
      {...props}
    >
      <span className="shrink-0">{icon ?? <BrandIcon name="danger" size={50} />}</span>
      <span>{children}</span>
    </div>
  )
}

export { DisclaimerCard }
