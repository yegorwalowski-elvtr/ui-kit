import * as React from "react"

import { cn } from "../../lib/utils"

/*
 * ELVTR PillInput — the Cream field on the mauve ground (Core Brand Guides
 * 2.0, "Intro Meeting UI", node 5709:5247): 522x56, 12px radius, 32/16
 * padding, Neue Montreal 24px, placeholder at 50% B&W/Dark.
 *
 * Borderless by design — the Cream/mauve contrast is the affordance — so the
 * focus ring is what makes it keyboard-visible. Do not remove it.
 */

function PillInput({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="pill-input"
      className={cn(
        "h-[56px] w-full max-w-[522px] min-w-0 rounded-[12px] bg-elvtr-cream px-[32px]",
        "font-sans text-[24px] leading-none font-medium tracking-[-0.03em] text-elvtr-dark",
        "outline-none placeholder:text-elvtr-dark/50",
        "selection:bg-elvtr-cola-latent selection:text-elvtr-cola-signal",
        "focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:ring-[3px] aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { PillInput }
