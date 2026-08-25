import * as React from "react"

/**
 * Closes a popover on outside pointer-down or Escape.
 *
 * The kit has the same hook for its own dropdowns, but it is not part of the
 * package's public exports, so the app keeps this copy for its account menu.
 */
export function useDismissOnOutside(open: boolean, onDismiss: () => void) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onDismiss()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss()
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onDismiss])

  return ref
}
