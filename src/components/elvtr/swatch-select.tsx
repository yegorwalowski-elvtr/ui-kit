"use client"

// Holds React state, so it declares a client boundary for React Server
// Component consumers (Next.js). Inert for bundlers that do not use RSC.
import * as React from "react"

import { svgSources } from "../../assets/icons/svg-sources"
import { cn } from "../../lib/utils"
import { useDismiss } from "../../lib/use-dismiss"
import {
  fieldBase,
  fieldFocus,
  fieldOption,
  fieldPlaceholder,
  fieldPopover,
} from "./field"

/*
 * ELVTR SwatchSelect — the Cream field of "Intro Meeting UI" (nodes 5715:6608 /
 * 5715:6613) as a dropdown whose rows carry a colour dot, so a colour is picked
 * by sight rather than by reading its name.
 *
 * A native <select> cannot render the dots, so this is a listbox: button +
 * popover, with the keyboard behaviour a select would have given for free
 * (Up/Down/Home/End to move, Enter/Space to choose, Escape to close, typing a
 * letter jumps to the next match).
 */

export interface SwatchOption {
  value: string
  label: string
  /** Any CSS colour. Pale swatches keep their hairline ring, so white reads. */
  color: string
  disabled?: boolean
}

export interface SwatchSelectProps {
  /** Shown while nothing is chosen — e.g. "Primary color". */
  placeholder: string
  options: readonly SwatchOption[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  /** Labels the control for assistive tech; there is no visible <label>. */
  "aria-label": string
  className?: string
  id?: string
}

function Dot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block size-[24px] shrink-0 rounded-full ring-1 ring-elvtr-dark/25 ring-inset",
        className
      )}
      style={{ backgroundColor: color }}
    />
  )
}

function SwatchSelect({
  placeholder,
  options,
  value,
  onValueChange,
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: SwatchSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const close = React.useCallback(() => setOpen(false), [])
  const root = useDismiss(open, close)

  const selectable = options.filter((option) => !option.disabled)
  const selected = options.find((option) => option.value === value) ?? null
  const listId = id ? `${id}-listbox` : undefined

  function commit(option: SwatchOption) {
    onValueChange(option.value)
    setOpen(false)
  }

  function move(delta: number) {
    if (selectable.length === 0) return
    setOpen(true)
    setActiveIndex((current) => {
      const from = current < 0 ? options.findIndex((o) => o.value === value) : current
      const next = from + delta
      // Skip over disabled rows in the direction of travel.
      for (let i = next; i >= 0 && i < options.length; i += delta > 0 ? 1 : -1) {
        if (!options[i].disabled) return i
      }
      return from < 0 ? options.findIndex((o) => !o.disabled) : from
    })
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        move(1)
        break
      case "ArrowUp":
        event.preventDefault()
        move(-1)
        break
      case "Home":
        event.preventDefault()
        setOpen(true)
        setActiveIndex(options.findIndex((option) => !option.disabled))
        break
      case "End":
        event.preventDefault()
        setOpen(true)
        setActiveIndex(options.reduce((last, o, i) => (o.disabled ? last : i), -1))
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (open && activeIndex >= 0) commit(options[activeIndex])
        else setOpen((current) => !current)
        break
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const index = options.findIndex(
            (option) =>
              !option.disabled &&
              option.label.toLowerCase().startsWith(event.key.toLowerCase())
          )
          if (index >= 0) {
            setOpen(true)
            setActiveIndex(index)
          }
        }
    }
  }

  return (
    <div ref={root} className={cn("relative w-full max-w-[255px]", className)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
        className={cn(
          fieldBase,
          fieldFocus,
          "flex cursor-pointer items-center gap-[14px] pr-[62px] text-left",
          !selected && fieldPlaceholder
        )}
      >
        {selected ? <Dot color={selected.color} /> : null}
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-[32px] h-[10.759px] w-[17.674px] -translate-y-1/2"
        >
          {/* Figma leaf box; the exported asset overhangs it by design. */}
          <span
            className="absolute -top-[1%] -right-[8%] -bottom-[1%] left-0 [&>svg]:block [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: svgSources["ui/chevron-down"] }}
          />
        </span>
      </button>

      {open ? (
        <ul id={listId} role="listbox" aria-label={ariaLabel} className={fieldPopover}>
          {options.map((option, index) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                disabled={option.disabled}
                data-active={index === activeIndex}
                data-selected={option.value === value}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(option)}
                className={cn(fieldOption, "disabled:opacity-40")}
              >
                <Dot color={option.color} />
                <span className="truncate">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export { SwatchSelect }
