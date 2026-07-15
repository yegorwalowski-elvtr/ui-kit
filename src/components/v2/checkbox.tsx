import * as React from "react"
import { Checkbox as CheckboxPrimitive, Switch as SwitchPrimitive } from "radix-ui"
import { Check } from "lucide-react"

import { cn } from "../../lib/utils"

/*
 * Circular consent checkbox. Figma "Agree state" 17968:18386:
 * checked = success green circle w/ white tick (28px desktop / 20 mobile);
 * empty = #D4D4D4; error = empty + 2px red ring. Copy turns red on error.
 */
export interface CircleCheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  error?: boolean
  size?: "desktop" | "mobile"
}

export function CircleCheckbox({ className, error, size = "desktop", ...props }: CircleCheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-btn-neutral-2 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-accent-600/40 data-[state=checked]:bg-success",
        size === "desktop" ? "size-7" : "size-5",
        error && "border-2 border-error-red",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className={cn("text-white", size === "desktop" ? "size-5" : "size-3.5")} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

/* Consent row: checkbox + copy, gap 16, items-start; error reddens all. */
export function AgreeRow({
  error,
  className,
  children,
  ...props
}: CircleCheckboxProps & { children: React.ReactNode }) {
  return (
    <label className={cn("flex w-full cursor-pointer items-start gap-4", className)}>
      <CircleCheckbox error={error} {...props} />
      <span className={cn("t-body-md", error ? "text-error-red" : "text-ink")}>{children}</span>
    </label>
  )
}

/*
 * Switch. Figma catalog sidebar "Show past courses": track 40×24 r12,
 * on = #17C964, 16px white thumb, hairline shadow.
 */
export function SiteSwitch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "h-6 w-10 shrink-0 cursor-pointer rounded-xl bg-btn-neutral-2 p-1 shadow-hairline transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-accent-600/40 data-[state=checked]:bg-switch-on",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 rounded-lg bg-white transition-transform data-[state=checked]:translate-x-4" />
    </SwitchPrimitive.Root>
  )
}
