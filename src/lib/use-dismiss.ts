import * as React from "react"

/**
 * Closes an open popover on outside pointer-down or Escape.
 *
 * Shared by the Cream-field dropdowns (`SwatchSelect`, `PillCombobox`) so both
 * behave identically. Listeners are only attached while `open` is true.
 */
export function useDismiss(
  open: boolean,
  onDismiss: () => void
): React.RefObject<HTMLDivElement | null> {
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
