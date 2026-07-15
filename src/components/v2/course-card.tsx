import * as React from "react"

import { cn } from "../../lib/utils"
import { Hairline } from "./cards"
import { AvatarStack } from "./avatar"

/*
 * Course card (254×352 r24 desktop). Figma "Card Hover" 17968:18835 +
 * "Card label" 17968:18490 + "Card description" 17968:18457.
 * Photo assets aren't bundled — `photoClass` supplies a bg (gradient
 * placeholder in the demo, real image in the app). Status band = 4 themed
 * variants; bottom block = blur + scrim; hover reveals the instructor.
 */
const LABELS = {
  bestseller: {
    text: "Best Seller",
    icon: "🏆",
    border: "border-[#F3FF64]",
    grad: "linear-gradient(180deg, rgba(228,213,51,.8) 0%, transparent 100%)",
  },
  lastcall: {
    text: "Last call",
    icon: "⏳",
    border: "border-[#FB98C7]",
    grad: "linear-gradient(180deg, rgba(196,45,131,.8) 0%, transparent 100%)",
  },
  new: {
    text: "New course",
    icon: "✨",
    border: "border-[#B4FB98]",
    grad: "linear-gradient(180deg, rgba(64,188,87,.8) 0%, transparent 100%)",
  },
  relaunch: {
    text: "Relaunch",
    icon: "🔄",
    border: "border-[#B8A0FF]",
    grad: "linear-gradient(180deg, rgba(125,90,247,.8) 0%, transparent 100%)",
  },
} as const

export interface CourseCardProps extends React.ComponentProps<"div"> {
  title: string
  instructor: string
  role?: string
  status?: keyof typeof LABELS
  meta?: string
  photoClass?: string
  /** per-course art-directed title styling (Figma uses custom faces) */
  titleClass?: string
}

export function CourseCard({
  title,
  instructor,
  role,
  status,
  meta,
  photoClass = "bg-[linear-gradient(160deg,#43364a,#171321)]",
  titleClass,
  className,
  ...props
}: CourseCardProps) {
  const label = status ? LABELS[status] : undefined
  return (
    <div
      className={cn(
        "group relative h-[352px] w-[254px] shrink-0 overflow-hidden rounded-3xl border-2 border-[#EAEAEA]/50",
        photoClass,
        className
      )}
      {...props}
    >
      {label && (
        <div
          className={cn("absolute inset-x-0 top-0 flex h-[81px] items-start justify-between border-t-2 border-r-2 border-l-2 p-4", label.border)}
          style={{ backgroundImage: `${label.grad}, linear-gradient(180deg, rgba(1,1,1,.5) 20%, rgba(48,48,48,0) 63%)` }}
        >
          <span className="t-button-2 flex items-center gap-1 text-white">
            <span aria-hidden>{label.icon}</span>
            {label.text}
          </span>
          {meta && <span className="t-button-2 text-white">{meta}</span>}
        </div>
      )}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-4 py-5 backdrop-blur-[7.5px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(52,52,52,0) 0%, rgba(18,18,18,.5) 30%, rgba(18,18,18,.75) 50%, #121212 100%)",
        }}
      >
        <span className={cn("t-h6 text-white", titleClass)}>{title}</span>
        <Hairline className="bg-white/20" />
        <div className="flex flex-col gap-1 opacity-80 transition-opacity group-hover:opacity-100">
          <span className="t-button-1 text-white">{instructor}</span>
          {role && (
            <span className="t-body-sm text-[#F3F3F3]/60 opacity-0 transition-opacity group-hover:opacity-100">
              {role}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/*
 * "See All Courses" grid tail card (17968:18869): accent bg, frosted
 * border, H4 white + avatar stack w/ +N counter. Mobile = full-width bar.
 */
export function SeeAllCoursesCard({
  count = "+13",
  className,
  ...props
}: React.ComponentProps<"div"> & { count?: string }) {
  return (
    <div
      className={cn(
        "border-frost flex h-[352px] w-[254px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl bg-accent-600 p-4 transition-colors hover:bg-accent-pressed",
        className
      )}
      {...props}
    >
      <span className="t-h4 text-white">See All Courses</span>
      <AvatarStack names={["Ada L", "Mia K", "Tom B", "Ira D"]} counter={count} />
    </div>
  )
}

/*
 * Story/success card (home testimonial carousel 17968:5711): pastel card
 * r16, photo top, title + category link + accent CTA bar.
 */
export function StoryCard({
  title,
  category,
  cta,
  pastelClass = "bg-[#EEBEAF]",
  accentClass = "bg-[#D05A36]",
  accentTextClass = "text-[#D05A36]",
  photoClass = "bg-[linear-gradient(160deg,#8a6f63,#4c352c)]",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  category: string
  cta: string
  pastelClass?: string
  accentClass?: string
  accentTextClass?: string
  photoClass?: string
}) {
  return (
    <div className={cn("flex h-[433px] w-[274px] shrink-0 flex-col overflow-hidden rounded-2xl", pastelClass, className)} {...props}>
      <div className={cn("h-[247px] w-full", photoClass)} />
      <div className="flex flex-1 flex-col items-center justify-between bg-white p-4 pb-2.5 text-center">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-lg font-medium text-ink">{title}</span>
          <span className={cn("t-h6", accentTextClass)}>{category}</span>
        </div>
        <button
          type="button"
          className={cn("t-button-2 w-full cursor-pointer rounded-[10px] p-3 text-white transition-opacity hover:opacity-90", accentClass)}
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
