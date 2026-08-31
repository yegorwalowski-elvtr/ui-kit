/**
 * @elvtr/ui-kit — ELVTR design-system foundation.
 *
 * Styles are exported separately — import once in your app entry:
 *   import "@elvtr/ui-kit/styles.css"
 */

// Utilities
export { cn } from "./lib/utils"

// shadcn/ui base components
export { Badge, badgeVariants } from "./components/ui/badge"
export { Button, buttonVariants } from "./components/ui/button"
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card"
export { Input } from "./components/ui/input"
export { Label } from "./components/ui/label"
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
} from "./components/ui/tabs"

// ELVTR brand components
export {
  BrandIcon,
  brandIconNames,
  type BrandIconName,
  type BrandIconProps,
} from "./components/elvtr/brand-icon"
export {
  AccountChip,
  initialsFrom,
  type AccountChipProps,
} from "./components/elvtr/account-chip"
export { Chip, chipVariants, type ChipProps } from "./components/elvtr/chip"
export { FieldChevron } from "./components/elvtr/chevron"
export { ColaButton, type ColaButtonProps } from "./components/elvtr/cola-button"
export { CtaButton, type CtaButtonProps } from "./components/elvtr/cta-button"
export { DetailTile, type DetailTileProps } from "./components/elvtr/detail-tile"
export {
  DisclaimerCard,
  type DisclaimerCardProps,
} from "./components/elvtr/disclaimer-card"
export {
  HeroStage,
  HeroStageActions,
  HeroStageCopy,
  type HeroStageProps,
  type HeroVideoSources,
} from "./components/elvtr/hero-stage"
export {
  PillCombobox,
  type ComboboxSuggestion,
  type PillComboboxProps,
} from "./components/elvtr/pill-combobox"
export { PillInput } from "./components/elvtr/pill-input"
export { PillSelect, type PillSelectProps } from "./components/elvtr/pill-select"
export {
  SecondaryLink,
  type SecondaryLinkProps,
} from "./components/elvtr/secondary-link"
export {
  SwatchSelect,
  type SwatchOption,
  type SwatchSelectProps,
} from "./components/elvtr/swatch-select"
export {
  SectionTabs,
  SectionTabsContent,
  type SectionTabItem,
  type SectionTabsProps,
} from "./components/elvtr/section-tabs"
export {
  Heading,
  headingVariants,
  Text,
  textVariants,
  type HeadingProps,
  type TextProps,
} from "./components/elvtr/typography"
