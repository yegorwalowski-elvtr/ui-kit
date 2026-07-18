import * as React from "react"

import { cn } from "../../lib/utils"

/*
 * ELVTR StatusGlyph — small circular status marker used by the Photo-Booth
 * check/verdict UIs: a tinted disc with a bold pass/fail/warn/pending glyph.
 * Decorative by default (aria-hidden) — pair it with visible text; pass
 * aria-hidden={false} + a label if the glyph must speak for itself.
 */

export type StatusKind = "pass" | "fail" | "warn" | "pending"

export interface StatusGlyphProps extends React.ComponentProps<"span"> {
  status: StatusKind
}

const statusStyles: Record<StatusKind, { glyph: string; className: string }> = {
  pass: { glyph: "✓", className: "bg-primary/10 text-primary" },
  fail: { glyph: "✗", className: "bg-elvtr-bad/15 text-elvtr-bad" },
  warn: { glyph: "!", className: "bg-elvtr-warn/40 text-foreground" },
  pending: { glyph: "…", className: "bg-foreground/5 text-foreground/45" },
}

function StatusGlyph({ status, className, ...props }: StatusGlyphProps) {
  const { glyph, className: statusClassName } = statusStyles[status]
  return (
    <span
      data-slot="status-glyph"
      aria-hidden
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full font-sans text-base font-bold select-none",
        statusClassName,
        className
      )}
      {...props}
    >
      {glyph}
    </span>
  )
}

export { StatusGlyph }
