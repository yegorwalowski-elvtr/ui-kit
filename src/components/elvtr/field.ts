/*
 * Shared geometry of the Cream field on the Mauve ground (Core Brand Guides
 * 2.0, "Intro Meeting UI", nodes 5709:5247 / 5715:6608): 56px tall, 12px
 * radius, 32px side padding, Neue Montreal 24px with -0.72px tracking.
 *
 * Borderless by design — the Cream/Mauve contrast is the affordance — so the
 * focus ring is what makes these keyboard-visible. Do not drop it.
 */

export const fieldBase =
  "h-[56px] w-full min-w-0 rounded-[12px] bg-elvtr-cream px-[32px] " +
  "font-sans text-[24px] leading-none font-medium tracking-[-0.03em] text-elvtr-dark " +
  "outline-none disabled:pointer-events-none disabled:opacity-50"

export const fieldFocus =
  "focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40"

/** The 50%-dark treatment Figma uses for an unfilled field's label. */
export const fieldPlaceholder = "text-elvtr-dark/50"

/** Cream popover listing options under a field. */
export const fieldPopover =
  "absolute top-[calc(100%+8px)] right-0 left-0 z-50 max-h-[280px] overflow-y-auto " +
  "rounded-[12px] bg-elvtr-cream p-[8px] shadow-[0_18px_40px_-12px_rgba(46,26,12,0.45)]"

/** One row inside `fieldPopover`. */
export const fieldOption =
  "flex w-full cursor-pointer items-center gap-[14px] rounded-[8px] px-[24px] py-[12px] " +
  "text-left font-sans text-[20px] leading-none font-medium text-elvtr-dark " +
  "data-[active=true]:bg-elvtr-cola-latent/10 data-[selected=true]:bg-elvtr-cola-latent/15"
