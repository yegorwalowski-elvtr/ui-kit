import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/*
 * ELVTR Chip — lime pill with Dark Teal text, like the "HR Materials"
 * cover chip in the ELVTR email/deck designs.
 * Brand rule: lime pairs ONLY with Dark Teal — never put white/light
 * text on lime.
 */

const chipVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full bg-accent font-sans font-medium whitespace-nowrap text-accent-foreground select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-6 px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3",
        /** ~30px pill — the Figma cover-chip height. */
        md: "h-[30px] px-4 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 px-5 text-base [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface ChipProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof chipVariants> {}

function Chip({ className, size, ...props }: ChipProps) {
  return (
    <span
      data-slot="chip"
      className={cn(chipVariants({ size }), className)}
      {...props}
    />
  )
}

export { Chip, chipVariants }
