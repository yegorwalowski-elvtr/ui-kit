import * as React from "react"

import { cn } from "../../lib/utils"
import { fieldBase, fieldFocus } from "./field"

/*
 * ELVTR PillInput — the Cream field on the Mauve ground (Core Brand Guides
 * 2.0, "Intro Meeting UI", node 5709:5247): 522x56, geometry from ./field.
 *
 * For a field that suggests as you type, use `PillCombobox`.
 */

function PillInput({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="pill-input"
      className={cn(
        fieldBase,
        fieldFocus,
        "max-w-[522px] placeholder:text-elvtr-dark/50",
        "selection:bg-elvtr-cola-latent selection:text-elvtr-cola-signal",
        "aria-invalid:ring-[3px] aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { PillInput }
