import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { TabsContent } from "../ui/tabs"

/*
 * ELVTR SectionTabs — the pill tab-row used as deck/section navigation in
 * the Photo Guide. Active pill: Dark Teal with light text. Inactive pill:
 * outlined, Dark Teal text.
 */

export interface SectionTabItem {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface SectionTabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root> {
  /** The pills to render, in order. */
  items: SectionTabItem[]
  /** Extra classes for the pill row (e.g. justify-center). */
  listClassName?: string
}

function SectionTabs({
  items,
  className,
  listClassName,
  children,
  ...props
}: SectionTabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="section-tabs"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <TabsPrimitive.List
        data-slot="section-tabs-list"
        className={cn("flex w-full flex-wrap items-center gap-2", listClassName)}
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            data-slot="section-tabs-trigger"
            className={cn(
              "inline-flex h-[34px] items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-transparent px-4 font-sans text-sm font-medium whitespace-nowrap text-primary transition-colors outline-none",
              "hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
              "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  )
}

/** Content panel for SectionTabs — match `value` to a SectionTabItem. */
const SectionTabsContent = TabsContent

export { SectionTabs, SectionTabsContent }
