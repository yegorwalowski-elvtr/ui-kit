import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

/*
 * 2026 button family. Figma: "Big buttons" 17968:17291, "Small buttons"
 * 17968:17165, "Link buttons" 17968:18848, "Color pair" 17968:12759.
 * cta/tint follow the theme (data-theme); nav/neutral/link are neutral.
 * Hover gradient + solid-white border and pressed fills are per Figma;
 * disabled/focus states are standardized (not drawn in Figma).
 */
const siteButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-accent-600/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        cta: "border-frost bg-accent-600 text-white hover:border-white hover:[background-image:linear-gradient(180deg,transparent,var(--accent-hover))] active:bg-accent-pressed",
        tint: "border-frost bg-accent-100 text-dim hover:border-white active:bg-accent-300",
        nav: "t-button-1 text-ink hover:border-frost hover:bg-control/30 hover:shadow-control aria-[current=page]:border-2 aria-[current=page]:border-white aria-[current=page]:bg-control aria-[current=page]:shadow-control",
        neutral: "bg-btn-neutral text-dim hover:bg-btn-neutral-2",
        link: "bg-control text-ink shadow-control hover:bg-white",
      },
      size: {
        xl: "h-[72px] gap-3 rounded-[20px] px-4 font-display text-[24px] font-[571] tracking-[-0.04em] capitalize",
        lg: "h-14 gap-2.5 rounded-[14px] px-4 font-display text-[20px] font-[571] tracking-[-0.04em] capitalize",
        md: "h-[44px] gap-2 rounded-[10px] px-4 font-display text-[20px] font-[571] tracking-[-0.04em] [&_svg:not([class*='size-'])]:size-6",
        sm: "h-[34px] gap-2 rounded-lg px-2.5 py-2 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: { variant: "cta", size: "lg" },
  }
)

export interface SiteButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof siteButtonVariants> {
  /** nav variant: marks the active page pill */
  active?: boolean
}

export function SiteButton({ className, variant, size, active, ...props }: SiteButtonProps) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      className={cn(siteButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

/*
 * Accordion disclosure toggle. Figma "Sullabus buttons" 17968:17937:
 * big = labeled "Show More/Show Less"; small = 52×39 icon-only pill.
 * Closed = neutral grey + chevron-down; open = themed solid + chevron-up.
 */
export interface DisclosureButtonProps extends React.ComponentProps<"button"> {
  open?: boolean
  size?: "big" | "small"
  labels?: [string, string]
}

export function DisclosureButton({
  open = false,
  size = "small",
  labels = ["Show More", "Show Less"],
  className,
  ...props
}: DisclosureButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-accent-600/40",
        open ? "border-frost bg-accent-600 text-white" : "text-[#373737]",
        size === "big"
          ? "h-[52px] px-5 py-4 font-display text-[20px] font-[571] tracking-[-0.04em]"
          : "h-[39px] w-[52px]",
        !open && (size === "big" ? "bg-btn-neutral" : "bg-btn-neutral-2"),
        className
      )}
      {...props}
    >
      {size === "big" && (open ? labels[1] : labels[0])}
      <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
    </button>
  )
}

export { siteButtonVariants }
