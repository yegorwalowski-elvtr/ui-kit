import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/*
 * ELVTR Chip — brand pill like the "HR Materials" cover chip in the
 * ELVTR email/deck designs, plus the Photo-Booth verdict/nav pills.
 * Brand rule: lime pairs ONLY with Dark Teal — never put white/light
 * text on lime.
 */

const chipVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full font-sans font-medium whitespace-nowrap select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Lime pill with Dark Teal text — the cover-chip look. */
        accent: "bg-accent text-accent-foreground",
        /** Dark Teal pill — carries LIME text per the brand rule (deck
            "HR Materials" chip on the dark hero), never white/light. */
        primary: "bg-primary text-elvtr-lime",
        /** Neutral tab-nav pill (Photo-Booth deck navigation). */
        pill: "bg-elvtr-pill text-foreground",
        /** "PERFECT photo" badge. */
        good: "bg-elvtr-good text-foreground",
        /** "BAD photo" badge. */
        bad: "bg-elvtr-bad text-white",
        warn: "bg-elvtr-warn text-foreground",
      },
      size: {
        sm: "h-6 px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3",
        /** ~30px pill — the Figma cover-chip height. */
        md: "h-[30px] px-4 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 px-5 text-base [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "md",
    },
  }
)

export interface ChipProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof chipVariants> {}

function Chip({ className, variant, size, ...props }: ChipProps) {
  return (
    <span
      data-slot="chip"
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Chip, chipVariants }
