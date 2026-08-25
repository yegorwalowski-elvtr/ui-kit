"use client"

import * as React from "react"
import { AccountChip, initialsFrom } from "@elvtr/ui-kit"

import { useDismissOnOutside } from "@/lib/use-dismiss-on-outside"

/*
 * The account marker from "Intro Meeting UI" (node 5722:11404) plus the one
 * thing it has to do: show who is signed in and let them out. The chip alone is
 * all the frame draws, so the menu stays a small Cream popover under it.
 */

export function AccountMenu({
  email,
  name,
  onSignOut,
}: {
  email: string
  name: string | null
  onSignOut: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const close = React.useCallback(() => setOpen(false), [])
  const root = useDismissOnOutside(open, close)

  return (
    <div ref={root} className="relative">
      <AccountChip
        initials={initialsFrom(name, email)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${email}`}
        onClick={() => setOpen((current) => !current)}
      />

      {open ? (
        <div
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-50 w-max min-w-[220px] rounded-[12px] bg-elvtr-cream p-[8px] shadow-[0_18px_40px_-12px_rgba(46,26,12,0.45)]"
        >
          <p className="max-w-[280px] truncate px-[16px] py-[10px] font-sans text-[16px] leading-none font-medium text-elvtr-dark/50">
            {email}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="w-full cursor-pointer rounded-[8px] px-[16px] py-[10px] text-left font-sans text-[18px] leading-none font-medium text-elvtr-dark outline-none hover:bg-elvtr-cola-latent/10 focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
