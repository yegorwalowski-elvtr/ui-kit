import * as React from "react"

import { cn } from "../../lib/utils"

// vuesax "bulk" brand icons exported from the ELVTR Figma files.
// The SVG sources use `fill="var(--fill-0, #004A4A)"`, so they render
// Dark Teal by default and can be recolored via the `color` prop.
import calendarRaw from "../../assets/icons/vuesax-bulk/calendar.svg?raw"
import clockRaw from "../../assets/icons/vuesax-bulk/clock.svg?raw"
import peopleRaw from "../../assets/icons/vuesax-bulk/people.svg?raw"
import textRaw from "../../assets/icons/vuesax-bulk/text.svg?raw"

const BRAND_ICONS = {
  calendar: calendarRaw,
  clock: clockRaw,
  people: peopleRaw,
  text: textRaw,
} as const

export type BrandIconName = keyof typeof BRAND_ICONS

export const brandIconNames = Object.keys(BRAND_ICONS) as BrandIconName[]

export interface BrandIconProps
  extends Omit<React.ComponentProps<"span">, "children" | "color"> {
  /** Which bundled vuesax-bulk icon to render. */
  name: BrandIconName
  /** Rendered box size in px (or any CSS length). Figma exports are 30x30. */
  size?: number | string
  /** Override the icon color (any CSS color). Defaults to Dark Teal #004A4A. */
  color?: string
}

/**
 * Renders one of the bundled ELVTR brand icons (vuesax "bulk" set) inline,
 * so the duotone opacity layers stay intact. For generic product icons,
 * use `lucide-react` instead.
 */
function BrandIcon({
  name,
  size = 30,
  color,
  className,
  style,
  ...props
}: BrandIconProps) {
  return (
    <span
      data-slot="brand-icon"
      role="img"
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cn(
        "inline-block shrink-0 align-middle [&>svg]:block [&>svg]:h-full [&>svg]:w-full",
        className
      )}
      style={
        {
          width: size,
          height: size,
          ...(color ? { "--fill-0": color } : null),
          ...style,
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: BRAND_ICONS[name] }}
      {...props}
    />
  )
}

export { BrandIcon }
