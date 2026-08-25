"use client"

// Holds React state, so it declares a client boundary for React Server
// Component consumers (Next.js). Inert for bundlers that do not use RSC.
import * as React from "react"

import { cn } from "../../lib/utils"
import { useDismiss } from "../../lib/use-dismiss"
import { fieldBase, fieldFocus, fieldOption, fieldPopover } from "./field"

/*
 * ELVTR PillCombobox — the Cream field of "Intro Meeting UI" (node 5709:5247)
 * with suggestions: the user types, matches appear underneath, and picking one
 * fills the field. Typing something not on the list is still allowed, so a
 * brand-new cohort can be entered before it shows up in the suggestion source.
 *
 * `suggestions` are supplied by the caller (fetched, debounced — whatever it
 * needs); this component only renders and navigates them.
 */

export interface ComboboxSuggestion {
  value: string
  /** Optional second line — e.g. the course title behind a cohort code. */
  detail?: string
}

export interface PillComboboxProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "onChange" | "type" | "role" | "list"
  > {
  value: string
  onValueChange: (value: string) => void
  /**
   * Fires when a suggestion is picked (not on every keystroke). Named `onPick`
   * rather than `onSelect` because the DOM already owns that handler on inputs.
   */
  onPick?: (value: string) => void
  suggestions: readonly ComboboxSuggestion[]
  /** Shown in place of the list while a lookup is in flight. */
  loading?: boolean
  /** Shown when a non-empty query returned nothing. */
  emptyMessage?: string
}

function PillCombobox({
  value,
  onValueChange,
  onPick,
  suggestions,
  loading = false,
  emptyMessage,
  className,
  id,
  onKeyDown,
  onFocus,
  ...props
}: PillComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const close = React.useCallback(() => setOpen(false), [])
  const root = useDismiss(open, close)

  const listId = id ? `${id}-listbox` : undefined
  const hasList = suggestions.length > 0
  const showPopover = open && (hasList || loading || Boolean(emptyMessage))

  // A fresh result set invalidates the highlight.
  React.useEffect(() => setActiveIndex(-1), [suggestions])

  function commit(suggestion: ComboboxSuggestion) {
    onValueChange(suggestion.value)
    onPick?.(suggestion.value)
    setOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!hasList) return
      event.preventDefault()
      setOpen(true)
      const delta = event.key === "ArrowDown" ? 1 : -1
      setActiveIndex((current) => {
        const next = current + delta
        if (next < 0) return suggestions.length - 1
        if (next >= suggestions.length) return 0
        return next
      })
      return
    }

    // Enter only intercepts an actual highlight — otherwise the form submits.
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault()
      commit(suggestions[activeIndex])
    }
  }

  const activeId =
    activeIndex >= 0 && listId ? `${listId}-option-${activeIndex}` : undefined

  return (
    <div ref={root} className={cn("relative w-full max-w-[522px]", className)}>
      <input
        {...props}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showPopover}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value)
          setOpen(true)
        }}
        onFocus={(event) => {
          onFocus?.(event)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          fieldBase,
          fieldFocus,
          "placeholder:text-elvtr-dark/50",
          "selection:bg-elvtr-cola-latent selection:text-elvtr-cola-signal",
          "aria-invalid:ring-[3px] aria-invalid:ring-destructive/40"
        )}
      />

      {showPopover ? (
        <ul id={listId} role="listbox" className={fieldPopover}>
          {hasList ? (
            suggestions.map((suggestion, index) => (
              <li key={suggestion.value}>
                <button
                  type="button"
                  role="option"
                  id={listId ? `${listId}-option-${index}` : undefined}
                  aria-selected={index === activeIndex}
                  data-active={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  // Keep focus in the input so the caret never disappears.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(suggestion)}
                  className={cn(fieldOption, "flex-col items-start gap-[4px]")}
                >
                  <span className="truncate">{suggestion.value}</span>
                  {suggestion.detail ? (
                    <span className="truncate text-[16px] text-elvtr-dark/50">
                      {suggestion.detail}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          ) : (
            <li
              className={cn(fieldOption, "cursor-default text-elvtr-dark/50")}
              // Status, not an option — screen readers should not count it.
              role="presentation"
            >
              {loading ? "Looking…" : emptyMessage}
            </li>
          )}
        </ul>
      ) : null}
    </div>
  )
}

export { PillCombobox }
