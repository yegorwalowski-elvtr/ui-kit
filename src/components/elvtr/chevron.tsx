import { svgSources } from "../../assets/icons/svg-sources"
import { cn } from "../../lib/utils"

/*
 * The dropdown chevron of the Cream field (Core Brand Guides 2.0, "Intro
 * Meeting UI", node 5764:7331 "arrow-square-down"): a filled 12.829 x 7.539
 * leaf at 50% B&W/Dark (#949494). Redrawn smaller than the earlier Union
 * glyph — down from 18.923 x 10.866 — so re-check both call sites' spacing
 * whenever this changes again.
 *
 * Shared by `PillSelect` and `SwatchSelect` so the two cannot drift.
 */
export function FieldChevron({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-[7.539px] w-[12.829px] shrink-0 [&>svg]:block [&>svg]:size-full",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svgSources["ui/chevron-down"] }}
    />
  )
}
