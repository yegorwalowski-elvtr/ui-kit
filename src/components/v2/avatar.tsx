import * as React from "react"

import { cn } from "../../lib/utils"

/*
 * Avatar. Figma uses two shapes: circles (40/48px, 2px white ring — hero
 * quote, avatar stacks) and rounded squares (44px r12 — testimonial
 * profiles). No photo assets in the kit → tinted placeholder + initials.
 */
export interface AvatarProps extends React.ComponentProps<"div"> {
  name?: string
  src?: string
  size?: number
  shape?: "circle" | "square"
  ring?: boolean
}

export function Avatar({
  name = "",
  src,
  size = 44,
  shape = "square",
  ring,
  className,
  ...props
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-avatar-placeholder select-none",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        ring && "ring-2 ring-white",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span className="t-body-sm text-white" style={{ fontSize: size * 0.32 }}>
          {initials}
        </span>
      )}
    </div>
  )
}

/*
 * Overlapping avatar row + counter chip. Figma SeeAllCoursesCard
 * 17968:18869: 48px circles, 2px white ring, −22px overlap, "+13"
 * counter on #67B5A1.
 */
export interface AvatarStackProps extends React.ComponentProps<"div"> {
  names: string[]
  counter?: string
  size?: number
  overlap?: number
}

export function AvatarStack({
  names,
  counter,
  size = 48,
  overlap = 22,
  className,
  ...props
}: AvatarStackProps) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      {names.map((n, i) => (
        <Avatar
          key={n + i}
          name={n}
          size={size}
          shape="circle"
          ring
          style={{ width: size, height: size, marginLeft: i === 0 ? 0 : -overlap }}
        />
      ))}
      {counter && (
        <span
          className="flex shrink-0 items-center justify-center rounded-full bg-avatar-counter font-sans text-base font-medium text-white ring-2 ring-white"
          style={{ width: size, height: size, marginLeft: -overlap }}
        >
          {counter}
        </span>
      )}
    </div>
  )
}

/*
 * Person row ("Profile" 17968:18136): avatar sq-12 + name (+16px LinkedIn
 * mark) + role. All on/off combinations from the 8 Figma variants come
 * from optional props.
 */
export interface PersonRowProps extends React.ComponentProps<"div"> {
  name: string
  role?: string
  src?: string
  linkedin?: boolean
  photo?: boolean
}

export function PersonRow({
  name,
  role,
  src,
  linkedin,
  photo = true,
  className,
  ...props
}: PersonRowProps) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      {photo && <Avatar name={name} src={src} />}
      <div className="flex flex-col justify-center gap-1">
        <span className="t-body-md flex items-center gap-1.5 text-ink">
          {name}
          {linkedin && (
            <span className="flex size-4 items-center justify-center rounded-[3px] bg-linkedin-blue text-[10px] font-bold text-white">
              in
            </span>
          )}
        </span>
        {role && <span className="t-body-sm text-meta">{role}</span>}
      </div>
    </div>
  )
}
