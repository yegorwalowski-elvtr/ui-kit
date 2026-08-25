import * as React from "react"

import { cn } from "../../lib/utils"
import { BrandIcon } from "./brand-icon"

/*
 * ELVTR DisclaimerCard — the Cream notice of "Intro Meeting UI" (node
 * 5722:4310): 20px radius, 30/20 padding, a 50px vuesax-bulk icon and one line
 * of Neue Montreal 20px at -0.4px tracking.
 *
 * Used for the things a run could not resolve and must not guess — a missing
 * Discord or Google Classroom link, a program manager who is not in the
 * directory, an unconfirmed course end date.
 */

export interface DisclaimerCardProps extends React.ComponentProps<"div"> {
  /** Defaults to the `warning` brand icon. Pass a node to override. */
  icon?: React.ReactNode
}

function DisclaimerCard({ icon, className, children, ...props }: DisclaimerCardProps) {
  return (
    <div
      data-slot="disclaimer-card"
      className={cn(
        "flex items-center gap-[25px] rounded-[20px] bg-elvtr-cream px-[30px] py-[20px]",
        "text-left font-sans text-[20px] leading-[1.2] font-medium tracking-[-0.02em] text-elvtr-dark",
        className
      )}
      {...props}
    >
      <span className="shrink-0">{icon ?? <BrandIcon name="warning" size={50} />}</span>
      <span>{children}</span>
    </div>
  )
}

export { DisclaimerCard }
