import { svgSources } from "../../assets/icons/svg-sources"
import { cn } from "../../lib/utils"

/*
 * The dropdown chevron of the Cream field (Core Brand Guides 2.0, "Intro
 * Meeting UI", node 5742:11454). Redrawn as one filled Union — it used to be
 * two stroked lines with a designed overhang, and is now an exact 18.923 x
 * 10.866 leaf, so it sits in the flow rather than needing absolute placement.
 *
 * Shared by `PillSelect` and `SwatchSelect` so the two cannot drift.
 */
export function FieldChevron({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-[10.866px] w-[18.923px] shrink-0 [&>svg]:block [&>svg]:size-full",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svgSources["ui/chevron-down"] }}
    />
  )
}
