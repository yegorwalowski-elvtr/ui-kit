import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "../../lib/utils"
import { RatingStars } from "./rating"
import { PersonRow } from "./avatar"

/* Hairline divider used inside tiles and under H5 headers (#E6E6E6/#ECECEC). */
export function Hairline({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("h-px w-full bg-[#E6E6E6]", className)} {...props} />
}

/*
 * Info tile ("Instructor info" 17968:18444): #F3F3F3 r16 p32 gap12 —
 * H5 title + hairline + Body Large. Mobile: r14, p24/20, Body Medium.
 */
export interface InfoCardProps extends React.ComponentProps<"div"> {
  title?: string
  device?: "desktop" | "mobile"
}

export function InfoCard({ title, device = "desktop", className, children, ...props }: InfoCardProps) {
  const desktop = device === "desktop"
  return (
    <div
      className={cn(
        "flex w-full flex-col bg-page",
        desktop ? "gap-3 rounded-2xl p-8" : "gap-2 rounded-[14px] px-6 py-5",
        className
      )}
      {...props}
    >
      {title && (
        <>
          <h5 className="t-h5 text-ink">{title}</h5>
          <Hairline />
        </>
      )}
      <div className={cn(desktop ? "t-body-lg" : "t-body-md", "text-body-text")}>{children}</div>
    </div>
  )
}

/*
 * Course hero detail card (184×142 white r16: icon + H6 + hairline +
 * label/value rows). Figma 17968:7928.
 */
export interface CourseDetailCardProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode
  title: string
  rows: Array<[string, string]>
}

export function CourseDetailCard({ icon, title, rows, className, ...props }: CourseDetailCardProps) {
  return (
    <div className={cn("flex w-[184px] flex-col gap-2 rounded-2xl bg-white px-6 py-5", className)} {...props}>
      <div className="flex items-center gap-2 [&_svg]:size-6 [&_svg]:text-accent-600">
        {icon}
        <span className="t-h6 text-ink">{title}</span>
      </div>
      <Hairline />
      {rows.map(([k, v]) => (
        <div key={k} className="t-button-1 flex justify-between gap-2">
          <span className="text-hush">{k}</span>
          <span className="text-ink-2">{v}</span>
        </div>
      ))}
    </div>
  )
}

/*
 * Stat pair (hero drafts 18101:4036 / lead-form band): AF 32–40 number in
 * accent (or white on dark) + NM label.
 */
export function StatPair({
  value,
  label,
  onDark,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string; label: string; onDark?: boolean }) {
  return (
    <div className={cn("flex items-baseline gap-2", className)} {...props}>
      <span className={cn("t-h4", onDark ? "text-white" : "text-accent-600")}>{value}</span>
      <span className={cn("t-body-lg", onDark ? "text-accent-100" : "text-[#272727]")}>{label}</span>
    </div>
  )
}

/*
 * Testimonial card (slot pattern, Figma 17968:18105/18106): #F3F3F3 r12
 * p20, children stack with 20px gaps — Rate / course link / quote / Profile.
 */
export function TestimonialCard({
  rating,
  course,
  quote,
  name,
  role,
  linkedin = true,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  rating?: number
  course?: string
  quote: string
  name: string
  role?: string
  linkedin?: boolean
}) {
  return (
    <div className={cn("flex w-[312px] max-w-full flex-col gap-5 rounded-xl bg-page p-5", className)} {...props}>
      {rating !== undefined && (
        <div className="flex items-center gap-2">
          <RatingStars value={rating} size={20} variant="boxed" />
          <span className="t-body-sm text-meta">{rating} Trustpilot</span>
        </div>
      )}
      {course && <span className="t-body-lg text-ink">{course}</span>}
      <p className="t-body-md text-body-text">{quote}</p>
      <PersonRow name={name} role={role} linkedin={linkedin} />
    </div>
  )
}

/*
 * Category card (home "Concise, Current, Currated" 17968:5676): 416×275
 * tile, H4 + Body Medium description + 3D render bottom-right.
 * 3D assets aren't in the kit — `art` slot takes an emoji/img placeholder.
 */
export function CategoryCard({
  title,
  description,
  art,
  className,
  ...props
}: React.ComponentProps<"div"> & { title: string; description?: string; art?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex h-[275px] w-full flex-col gap-2 overflow-hidden rounded-2xl border-2 border-white/40 bg-page p-6",
        className
      )}
      {...props}
    >
      <h4 className="t-h4 text-ink">{title}</h4>
      {description && <p className="t-body-md max-w-[55%] text-muted-warm">{description}</p>}
      <div className="absolute right-4 bottom-4 text-[72px] leading-none">{art}</div>
    </div>
  )
}

/*
 * Bento tile ("Best Learning Experience" 17968:5838): pastel bg, r20 p24,
 * H4/H6 label + 3D icon. tone maps the three Figma pastels.
 */
export function BentoTile({
  title,
  tone = "lavender",
  icon,
  wide,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  tone?: "lavender" | "mint" | "cream"
  icon?: React.ReactNode
  wide?: boolean
}) {
  const bg = { lavender: "bg-[#EAEDFF]", mint: "bg-[#D9EDEE]", cream: "bg-[#F7ECDD]" }[tone]
  return (
    <div
      className={cn(
        "flex h-[232px] rounded-[20px] border-2 border-white/40 p-6",
        bg,
        wide ? "flex-row items-center justify-between" : "flex-col justify-between",
        className
      )}
      {...props}
    >
      {wide ? (
        <>
          <h4 className="t-h4 max-w-[50%] text-ink">{title}</h4>
          <div className="text-[96px] leading-none">{icon}</div>
        </>
      ) : (
        <>
          <div className="text-[44px] leading-none">{icon}</div>
          <h4 className="t-h4 text-ink">{title}</h4>
        </>
      )}
    </div>
  )
}

/*
 * Section header band: H2 + Body-Large sub, optional right CTA slot,
 * 48px gap to content (universal on every page).
 */
export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  ...props
}: React.ComponentProps<"div"> & { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)} {...props}>
      <div className="flex flex-col gap-4">
        <h2 className="t-h2 text-ink">{title}</h2>
        {subtitle && <p className="t-body-lg max-w-[553px] text-muted-warm">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* Breadcrumbs (course/catalog bars): NM 14; past #A6A6A6 → current #282828. */
export function Breadcrumbs({ items, className, ...props }: React.ComponentProps<"nav"> & { items: string[] }) {
  return (
    <nav className={cn("t-button-1 flex items-center gap-3", className)} {...props}>
      {items.map((item, i) => (
        <React.Fragment key={item}>
          {i > 0 && <ChevronRight className="size-2.5 text-hush" />}
          <span className={i === items.length - 1 ? "text-ink-2" : "text-hush"}>{item}</span>
        </React.Fragment>
      ))}
    </nav>
  )
}

/*
 * Tooltip bubble (from "Stand with UA" hover 17968:17181): white r12
 * px16 py8 + caret. Static presentational atom; interactive wiring comes
 * with the Base UI Tooltip in the app phase.
 */
export function TooltipBubble({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <span className="absolute -top-1 left-6 size-3 rotate-45 bg-white" />
      <div className="t-button-1 rounded-xl bg-white px-4 py-2 text-ink shadow-control">{children}</div>
    </div>
  )
}

/*
 * Pixel-cluster brand decor (Components 6–10, F1/F2): 28px rounded
 * squares on a 28px grid merging into tetromino-ish bars.
 */
export function PixelDecor({
  color = "var(--trustpilot)",
  cells = [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [3, 3],
    [0, 2],
  ],
  unit = 28,
  className,
  ...props
}: React.ComponentProps<"div"> & { color?: string; cells?: Array<[number, number]>; unit?: number }) {
  const w = Math.max(...cells.map(([x]) => x)) + 1
  const h = Math.max(...cells.map(([, y]) => y)) + 1
  return (
    <div className={cn("relative", className)} style={{ width: w * unit, height: h * unit }} {...props}>
      {cells.map(([x, y], i) => (
        <span
          key={i}
          className="absolute rounded-lg"
          style={{ left: x * unit, top: y * unit, width: unit, height: unit, background: color }}
        />
      ))}
    </div>
  )
}
