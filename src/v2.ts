/**
 * @elvtr/ui-kit/v2 — components for the 2026 elvtr.com redesign.
 * Tokens: import "@elvtr/ui-kit/theme-2026.css" (instead of styles.css —
 * it already includes Tailwind, fonts and the shadcn slot mapping).
 * Spec source: docs/DESIGN-SYSTEM-PLAN.md (Figma "New Website" file).
 */
export { SiteButton, DisclosureButton, siteButtonVariants, type SiteButtonProps, type DisclosureButtonProps } from "./components/v2/button"
export { Tag, MetaChip, tagVariants, type TagProps, type MetaChipProps } from "./components/v2/tag"
export { UnderlineField, PhoneField, SearchBar, type UnderlineFieldProps, type PhoneFieldProps } from "./components/v2/input"
export { CircleCheckbox, AgreeRow, SiteSwitch, type CircleCheckboxProps } from "./components/v2/checkbox"
export { RatingStars, TrustpilotBadge, RatingScoreCard, type RatingStarsProps, type RatingScoreCardProps } from "./components/v2/rating"
export { Avatar, AvatarStack, PersonRow, type AvatarProps, type AvatarStackProps, type PersonRowProps } from "./components/v2/avatar"
export {
  Hairline,
  InfoCard,
  CourseDetailCard,
  StatPair,
  TestimonialCard,
  CategoryCard,
  BentoTile,
  SectionHeader,
  Breadcrumbs,
  TooltipBubble,
  PixelDecor,
  type InfoCardProps,
  type CourseDetailCardProps,
} from "./components/v2/cards"
export { CourseCard, SeeAllCoursesCard, StoryCard, type CourseCardProps } from "./components/v2/course-card"
export { FaqItem, SyllabusRow, type FaqItemProps, type SyllabusRowProps } from "./components/v2/accordion"
