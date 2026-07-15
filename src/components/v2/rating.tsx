import * as React from "react"

import { cn } from "../../lib/utils"

/*
 * Star atoms + rating rows. Figma "Rate" 17968:18107.
 * plain  = star glyphs; fractions via a width-mask overlay (colored star
 *          clipped over a grey star), exactly as drawn in Figma.
 * boxed  = Trustpilot style: green rounded square + white star glyph;
 *          empty box #DCDCE6.
 * Sizes seen in Figma: 14px (hero badge) and 20px (testimonials).
 * Tone: Trustpilot green (default) or yellow (Google/Facebook score cards).
 */
const STAR_PATH =
  "M12 2l2.94 6.26 6.87.63-5.18 4.57 1.52 6.73L12 16.7l-6.15 3.49 1.52-6.73L2.19 8.89l6.87-.63L12 2z"

function StarGlyph({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
  )
}

export interface RatingStarsProps extends React.ComponentProps<"div"> {
  /** 0–5, fractions supported (width-mask, per Figma) */
  value?: number
  size?: 14 | 20
  variant?: "plain" | "boxed"
  tone?: "green" | "yellow"
}

export function RatingStars({
  value = 5,
  size = 20,
  variant = "plain",
  tone = "green",
  className,
  ...props
}: RatingStarsProps) {
  const gap = size === 14 ? 1.4 : 2
  const fillColor = tone === "green" ? "var(--trustpilot)" : "#FFCE00"
  return (
    <div
      role="img"
      aria-label={`${value} out of 5 stars`}
      className={cn("flex items-center", className)}
      style={{ gap }}
      {...props}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i))
        return variant === "plain" ? (
          <span key={i} className="relative block" style={{ width: size, height: size }}>
            <StarGlyph className="absolute inset-0 size-full text-[#F5F5F5]" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarGlyph style={{ width: size, height: size, color: fillColor }} />
            </span>
          </span>
        ) : (
          <span
            key={i}
            className="relative block overflow-hidden rounded-[3px] bg-star-empty-boxed"
            style={{ width: size, height: size }}
          >
            <span className="absolute inset-0" style={{ width: `${fill * 100}%`, background: fillColor }} />
            <StarGlyph
              className="absolute inset-0 m-auto text-white"
              style={{ width: size * 0.72, height: size * 0.66 }}
            />
          </span>
        )
      })}
    </div>
  )
}

/*
 * Trustpilot badge pill. Figma 17991:23747: white pill r-full px20 py10,
 * 14px boxed stars + "4.9 Trustpilot" NM 14.
 */
export function TrustpilotBadge({
  value = 4.9,
  className,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  return (
    <div
      className={cn("inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5", className)}
      {...props}
    >
      <RatingStars value={value} size={14} variant="boxed" />
      <span className="t-button-1 tracking-[-0.02em] text-black">{value} Trustpilot</span>
    </div>
  )
}

/*
 * Review-source score card. Figma course-page ratings band 17968:7990:
 * white r16 (h96 desktop): AF-40 score · hairline · stars + caption.
 * Trustpilot = green boxed stars; Google/Facebook = yellow plain stars.
 */
export interface RatingScoreCardProps extends React.ComponentProps<"div"> {
  score: number
  reviews: number
  source: string
  trustpilot?: boolean
}

export function RatingScoreCard({
  score,
  reviews,
  source,
  trustpilot,
  className,
  ...props
}: RatingScoreCardProps) {
  return (
    <div
      className={cn("flex w-[400px] max-w-full items-center gap-5 rounded-2xl bg-white p-5", className)}
      {...props}
    >
      <span className="t-h3 text-ink">{score}</span>
      <span className="h-10 w-px bg-line" />
      <div className="flex flex-col gap-1.5">
        <RatingStars
          value={score}
          size={20}
          variant={trustpilot ? "boxed" : "plain"}
          tone={trustpilot ? "green" : "yellow"}
        />
        <span className="t-body-sm text-meta">
          {reviews} reviews on <span className="font-bold text-ink-2">{source}</span>
        </span>
      </div>
    </div>
  )
}
