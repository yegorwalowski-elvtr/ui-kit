import * as React from "react"

import { cn } from "../../lib/utils"

/*
 * ELVTR DetailTile — replica of the "Session Details" tiles in the
 * Student Care email: Alice Blue tile, 15px radius, vuesax-bulk icon,
 * ABC Arizona Flare label (Dark Teal, 22px), Neue Montreal 16px body.
 */

export interface DetailTileProps extends React.ComponentProps<"div"> {
  /** Tile icon — typically `<BrandIcon name="…" />` (30px vuesax-bulk). */
  icon?: React.ReactNode
  /** Tile header, set in ABC Arizona Flare 22px Dark Teal. */
  label: React.ReactNode
}

function DetailTile({ icon, label, className, children, ...props }: DetailTileProps) {
  return (
    <div
      data-slot="detail-tile"
      className={cn(
        "flex flex-col items-start gap-2.5 rounded-lg bg-card p-5 text-card-foreground",
        className
      )}
      {...props}
    >
      {icon ? (
        <div data-slot="detail-tile-icon" className="text-primary">
          {icon}
        </div>
      ) : null}
      <div
        data-slot="detail-tile-label"
        className="font-display text-[22px] font-medium leading-[1.1] tracking-[-0.6px] text-primary"
      >
        {label}
      </div>
      {children != null ? (
        <div
          data-slot="detail-tile-body"
          className="font-sans text-[16px] font-medium leading-[1.2] text-foreground"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export { DetailTile }
