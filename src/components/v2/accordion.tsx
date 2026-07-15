import * as React from "react"

import { cn } from "../../lib/utils"
import { DisclosureButton } from "./button"
import { MetaChip } from "./tag"

/*
 * FAQ accordion item (course/catalog FAQ 17968:9022): closed = #F3F3F3
 * r16 h87; open = theme tint. Question in H5; grey chevron pill →
 * themed circle.
 */
export interface FaqItemProps extends React.ComponentProps<"div"> {
  question: string
  defaultOpen?: boolean
}

export function FaqItem({ question, defaultOpen = false, className, children, ...props }: FaqItemProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl px-8 py-6 transition-colors",
        open ? "bg-accent-100" : "bg-page",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-6">
        <span className="t-h5 text-ink">{question}</span>
        <DisclosureButton open={open} onClick={() => setOpen(!open)} aria-label={open ? "Collapse" : "Expand"} />
      </div>
      {open && <div className="t-body-md max-w-[85%] text-body-text">{children}</div>}
    </div>
  )
}

/*
 * Syllabus lesson row (17968:8778): ghost AF numeral, H5 title, meta
 * chips; expanded = tint bg, description + tick bullets + themed chip.
 */
export interface SyllabusRowProps extends React.ComponentProps<"div"> {
  number: string
  title: string
  meta?: string[]
  lessonType?: string
  bullets?: string[]
  defaultOpen?: boolean
}

export function SyllabusRow({
  number,
  title,
  meta = [],
  lessonType,
  bullets = [],
  defaultOpen = false,
  className,
  children,
  ...props
}: SyllabusRowProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-[20px] px-8 py-6 transition-colors",
        open ? "bg-accent-100" : "bg-page",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-6">
        <span
          className={cn(
            "font-display text-[64px] leading-none font-[442] tracking-[-0.04em]",
            open ? "text-accent-300" : "text-numeral-ghost"
          )}
        >
          {number}
        </span>
        <div className="flex flex-1 flex-col gap-3">
          <span className="t-h5 text-ink">{title}</span>
          <div className="flex flex-wrap items-center gap-2">
            {meta.map((m) => (
              <MetaChip key={m}>{m}</MetaChip>
            ))}
            {lessonType && <MetaChip themed>{lessonType}</MetaChip>}
          </div>
        </div>
        <DisclosureButton
          open={open}
          size="big"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse lesson" : "Expand lesson"}
        />
      </div>
      {open && (
        <div className="flex max-w-[75%] flex-col gap-3 pl-2">
          {children && <p className="t-body-md text-body-text">{children}</p>}
          {bullets.length > 0 && (
            <ul className="flex flex-col gap-3">
              {bullets.map((b) => (
                <li key={b} className="t-body-md flex items-start gap-3 text-body-text">
                  <span className="mt-0.5 text-accent-600">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
