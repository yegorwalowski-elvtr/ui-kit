import * as React from "react"

import { cn } from "../../lib/utils"

/*
 * ELVTR AccountChip — the signed-in marker at the top right of the Cola Orange
 * screens (Core Brand Guides 2.0, "Intro Meeting UI", node 5722:11404): a 50px
 * Cream square with the person's initials in Neue Montreal at 50% B&W/Dark.
 *
 * Renders a <button> when given an `onClick` (so it can open an account menu)
 * and a plain <span> otherwise.
 */

/** "Kateryna Shevchenko" / "kateryna.shevchenko@elvtr.com" -> "KS". */
export function initialsFrom(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  const source = name?.trim() || email?.split("@")[0]?.replace(/[._-]+/g, " ").trim()
  if (!source) return "?"

  const parts = source.split(/\s+/).filter(Boolean)
  const letters =
    parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2)

  return letters.toUpperCase()
}

export interface AccountChipProps extends React.ComponentProps<"button"> {
  /** Initials to show — build them with `initialsFrom`. */
  initials: string
}

function AccountChip({ initials, className, ...props }: AccountChipProps) {
  return (
    <button
      type="button"
      data-slot="account-chip"
      className={cn(
        "flex size-[50px] shrink-0 items-center justify-center rounded-[14px] bg-elvtr-cream",
        "font-sans text-[18px] leading-none font-medium text-elvtr-dark/50 uppercase",
        "cursor-pointer transition-colors outline-none hover:text-elvtr-dark",
        "focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40",
        className
      )}
      {...props}
    >
      {initials}
    </button>
  )
}

export { AccountChip }
