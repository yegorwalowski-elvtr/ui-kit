import * as React from "react"

import { svgSources } from "../../assets/icons/svg-sources"
import { cn } from "../../lib/utils"
import { fieldBase, fieldFocus, fieldPlaceholder } from "./field"

/*
 * ELVTR PillSelect — the Cream dropdown of the Cola Orange screens (Core
 * Brand Guides 2.0, "Intro Meeting UI", nodes 5715:6608 / 5715:6613):
 * 255x56, 12px radius, 32/16 padding, Neue Montreal 24px, the label at 50%
 * B&W/Dark until a value is chosen, chevron pinned right.
 *
 * A native `<select>` on purpose: it is one control, it gets the platform
 * picker (including on mobile) and full keyboard behaviour for free. The
 * chevron is the exported Figma asset (17.674 x 10.759 leaf inside its own
 * 19.088 x 10.974 canvas — the overhang is designed, keep both boxes).
 *
 * When the options are colours, use `SwatchSelect` instead — a native option
 * list cannot render the swatch dots.
 */

/** Placeholder-first option list: `value=""` renders as the muted label. */
export interface PillSelectProps extends Omit<React.ComponentProps<"select">, "children"> {
  /** Shown while `value` is empty — e.g. "Primary color". */
  placeholder: string
  options: readonly { value: string; label: string; disabled?: boolean }[]
}

function PillSelect({
  className,
  placeholder,
  options,
  value,
  ...props
}: PillSelectProps) {
  const isEmpty = value === "" || value == null
  return (
    <div data-slot="pill-select" className={cn("relative w-full max-w-[255px]", className)}>
      <select
        value={value}
        className={cn(
          fieldBase,
          fieldFocus,
          "cursor-pointer appearance-none pr-[62px]",
          isEmpty && fieldPlaceholder
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Figma leaf box; the asset overhangs it by design (inset -1% / -8%). */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[32px] h-[10.759px] w-[17.674px] -translate-y-1/2"
      >
        <span
          className="absolute -top-[1%] -right-[8%] -bottom-[1%] left-0 [&>svg]:block [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: svgSources["ui/chevron-down"] }}
        />
      </span>
    </div>
  )
}

export { PillSelect }
