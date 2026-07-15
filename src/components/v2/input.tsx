import * as React from "react"
import { Search, SlidersHorizontal } from "lucide-react"

import { cn } from "../../lib/utils"

/*
 * Underline text field. Figma "Form State" 17968:18365: no box — a 2px
 * bottom border; floating 12px label appears once focused/filled.
 * Underline: default #A3A3A3 → focus/filled success green → error red.
 * Desktop h56 / Body Large value; mobile h49 / Body Medium.
 */
export interface UnderlineFieldProps extends Omit<React.ComponentProps<"input">, "size"> {
  label: string
  error?: string
  fieldSize?: "desktop" | "mobile"
}

export function UnderlineField({
  label,
  error,
  fieldSize = "desktop",
  className,
  onFocus,
  onBlur,
  onChange,
  ...props
}: UnderlineFieldProps) {
  const [focused, setFocused] = React.useState(false)
  const [filled, setFilled] = React.useState(Boolean(props.value ?? props.defaultValue))
  const raised = focused || filled
  const desktop = fieldSize === "desktop"

  return (
    <label className={cn("group flex w-full flex-col", className)}>
      <span
        className={cn(
          "t-body-sm transition-all",
          error ? "text-error-red" : "text-faint",
          raised || error ? "mb-2 opacity-100" : "h-0 overflow-hidden opacity-0"
        )}
      >
        {error ?? label}
      </span>
      <input
        className={cn(
          "w-full border-b-2 bg-transparent pb-3 outline-none placeholder:text-faint",
          desktop ? "t-body-lg" : "t-body-md",
          "text-ink",
          error ? "border-error-red" : raised ? "border-success" : "border-faint"
        )}
        placeholder={raised ? undefined : label}
        aria-invalid={Boolean(error) || undefined}
        onFocus={(e) => (setFocused(true), onFocus?.(e))}
        onBlur={(e) => (setFocused(false), onBlur?.(e))}
        onChange={(e) => (setFilled(e.target.value.length > 0), onChange?.(e))}
        {...props}
      />
    </label>
  )
}

/*
 * Phone field: 75px country-code segment (flag + dial code, own underline)
 * + number field, 16px gap. Figma LeadFormCard 17968:18735. The country
 * picker dropdown is a white r16 panel with h40 rows (see plan §4.1).
 */
export interface PhoneFieldProps extends Omit<UnderlineFieldProps, "label"> {
  label?: string
  countryFlag?: string
  dialCode?: string
}

export function PhoneField({
  label = "Phone number",
  countryFlag = "🇺🇸",
  dialCode = "+1",
  className,
  ...props
}: PhoneFieldProps) {
  return (
    <div className={cn("flex w-full items-end gap-4", className)}>
      <button
        type="button"
        className="t-body-lg flex w-[75px] shrink-0 cursor-pointer items-center gap-2 border-b-2 border-faint pb-3 text-ink outline-none hover:border-success focus-visible:border-success"
      >
        <span className="text-2xl leading-none">{countryFlag}</span>
        {dialCode}
      </button>
      <UnderlineField label={label} inputMode="tel" placeholder="000 000 000" {...props} />
    </div>
  )
}

/*
 * Catalog search bar + filter icon-button. Figma "Filter + search"
 * 17968:18671: input h40 r10 bg control w/ 2px white border + control
 * shadow; themed 44×40 filter button.
 */
export function SearchBar({
  className,
  onFilterClick,
  ...props
}: React.ComponentProps<"input"> & { onFilterClick?: () => void }) {
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <div className="flex h-10 flex-1 items-center gap-2 rounded-[10px] border-2 border-white bg-control px-3 shadow-control">
        <Search className="size-3 text-faint" />
        <input
          className="t-button-1 w-full bg-transparent text-ink outline-none placeholder:text-[#A0A0A0]"
          placeholder="Search"
          {...props}
        />
      </div>
      <button
        type="button"
        aria-label="Filters"
        onClick={onFilterClick}
        className="border-frost flex h-10 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-accent-600 text-white outline-none hover:bg-accent-pressed focus-visible:ring-[3px] focus-visible:ring-accent-600/40"
      >
        <SlidersHorizontal className="size-5" />
      </button>
    </div>
  )
}
