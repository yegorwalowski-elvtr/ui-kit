import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/*
 * Status tag chip. Figma "Tags" 17968:18810: h35, r12, px16 py10,
 * 15px icon + Button-2 label. Five colorways from the status system.
 */
const tagVariants = cva(
  "t-button-2 inline-flex h-[35px] shrink-0 items-center gap-1 rounded-xl px-4 py-2.5 [&_svg]:size-[15px]",
  {
    variants: {
      status: {
        bestseller: "bg-tag-bestseller-bg text-tag-bestseller-fg",
        lastcall: "bg-tag-lastcall-bg text-tag-lastcall-fg",
        new: "bg-tag-new-bg text-tag-new-fg",
        relaunch: "bg-tag-relaunch-bg text-tag-relaunch-fg",
        neutral: "bg-tag-neutral-bg text-tag-neutral-fg",
        themed: "bg-accent-100 text-ink-2",
      },
    },
    defaultVariants: { status: "neutral" },
  }
)

export interface TagProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof tagVariants> {}

export function Tag({ className, status, ...props }: TagProps) {
  return <span className={cn(tagVariants({ status }), className)} {...props} />
}

/*
 * Syllabus meta chip. Figma course-page syllabus rows: white pill h31,
 * r10, px10 py6, 16px icon + NM 12 #5A5A5A. Themed variant = accent-300
 * with white text ("Assignement"/"Workshop" lesson-type chip).
 */
export interface MetaChipProps extends React.ComponentProps<"span"> {
  themed?: boolean
}

export function MetaChip({ className, themed, ...props }: MetaChipProps) {
  return (
    <span
      className={cn(
        "t-body-sm inline-flex h-[31px] shrink-0 items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 [&_svg]:size-4",
        themed ? "border-frost bg-accent-300 text-white" : "bg-white text-muted-warm",
        className
      )}
      {...props}
    />
  )
}

export { tagVariants }
