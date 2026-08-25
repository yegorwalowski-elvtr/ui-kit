import { useState, type ReactNode } from "react"

import { ArrowUpRight, Camera, Sparkles } from "lucide-react"

import {
  Badge,
  BrandIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  AccountChip,
  Chip,
  ColaButton,
  CtaButton,
  DetailTile,
  DisclaimerCard,
  Heading,
  HeroStage,
  HeroStageActions,
  HeroStageCopy,
  Input,
  Label,
  PillCombobox,
  PillInput,
  PillSelect,
  SwatchSelect,
  SectionTabs,
  SectionTabsContent,
  Text,
} from "../index"

/* ---------------------------------------------------------------- helpers */

interface SwatchSpec {
  figmaName: string
  cssVar: string
  hex: string
  usage: string
  swatchClass: string
  labelClass: string
  note?: string
}

const SWATCHES: SwatchSpec[] = [
  {
    figmaName: "Green-Lime Palette/Dark Teal",
    cssVar: "--elvtr-dark-teal",
    hex: "#004A4A",
    usage: "Primary brand · hero bg · headings on light",
    swatchClass: "bg-elvtr-dark-teal",
    labelClass: "text-elvtr-light",
  },
  {
    figmaName: "Lime accent",
    cssVar: "--elvtr-lime",
    hex: "#C8FF68",
    usage: "Chips · highlight text on teal (pairs ONLY with Dark Teal)",
    swatchClass: "bg-elvtr-lime",
    labelClass: "text-elvtr-dark-teal",
  },
  {
    figmaName: "Alice Blue",
    cssVar: "--elvtr-alice-blue",
    hex: "#EBF2F4",
    usage: "Info-tile / card background",
    swatchClass: "bg-elvtr-alice-blue",
    labelClass: "text-elvtr-dark",
  },
  {
    figmaName: "B&W/Dark",
    cssVar: "--elvtr-dark",
    hex: "#212121",
    usage: "Body text",
    swatchClass: "bg-elvtr-dark",
    labelClass: "text-elvtr-light",
  },
  {
    figmaName: "Light",
    cssVar: "--elvtr-light",
    hex: "#F3F3F3",
    usage: "Light text on teal · light neutral",
    swatchClass: "bg-elvtr-light",
    labelClass: "text-elvtr-dark",
  },
  {
    figmaName: "Sand",
    cssVar: "--elvtr-sand",
    hex: "#F2EFE9",
    usage: "Page background behind cards",
    swatchClass: "bg-elvtr-sand",
    labelClass: "text-elvtr-dark",
    note: "TODO confirm exact hex with Design Team",
  },
  {
    figmaName: "Brand/Cola Orange/Signal",
    cssVar: "--elvtr-cola-signal",
    hex: "#FF8A00",
    usage: "CTA ink — only ever on Cola Orange Latent",
    swatchClass: "bg-elvtr-cola-signal",
    labelClass: "text-elvtr-cola-latent",
  },
  {
    figmaName: "Brand/Cola Orange/Latent",
    cssVar: "--elvtr-cola-latent",
    hex: "#2E1A0C",
    usage: "CTA ground under Signal ink",
    swatchClass: "bg-elvtr-cola-latent",
    labelClass: "text-elvtr-cola-signal",
  },
  {
    figmaName: "Mauve (Intro Meeting UI)",
    cssVar: "--elvtr-mauve",
    hex: "#C2B2B3",
    usage: "Page ground of the Cola Orange screens",
    swatchClass: "bg-elvtr-mauve",
    labelClass: "text-elvtr-dark",
    note: "Raw hex in Figma — TODO tokenize with Design Team",
  },
  {
    figmaName: "Cream (Intro Meeting UI)",
    cssVar: "--elvtr-cream",
    hex: "#F9EFEC",
    usage: "Field ground on Mauve",
    swatchClass: "bg-elvtr-cream",
    labelClass: "text-elvtr-dark",
    note: "Raw hex in Figma — TODO tokenize with Design Team",
  },
]

function Swatch({ spec }: { spec: SwatchSpec }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-elvtr-light">
      <div
        className={`flex h-24 items-end p-3 ${spec.swatchClass} ${spec.labelClass}`}
      >
        <span className="font-mono text-sm">{spec.hex}</span>
      </div>
      <div className="space-y-1 p-3">
        <Text variant="p2" className="font-semibold">
          {spec.figmaName}
        </Text>
        <Text variant="caption" as="p" className="font-mono">
          {spec.cssVar}
        </Text>
        <Text variant="caption">{spec.usage}</Text>
        {spec.note ? (
          <Text variant="caption" className="text-destructive">
            {spec.note}
          </Text>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------------------------------- Cola Orange surface preview */

/**
 * Live preview of the Cola Orange screens (Core Brand Guides 2.0, "Intro
 * Meeting UI"). `HeroStage` is a full-viewport shell, so the demo caps its
 * height to keep it inside the page.
 */
const DEMO_COHORTS = [
  { value: "GD10", detail: "Game Design with Unreal Engine 5" },
  { value: "GWA2", detail: "Advanced Game Writing" },
  { value: "UK-GW11", detail: "Video Game Writing" },
]

/* Swatch hexes live in the consuming app — see apps/meetball/src/lib/colors.ts. */
const DEMO_BASES = [
  { value: "blue", label: "Blue", color: "#102E9C" },
  { value: "green", label: "Green", color: "#025453" },
  { value: "purple", label: "Purple", color: "#58438A" },
  { value: "white", label: "White", color: "#F9F9F9" },
]

function ColaSurfacePreview() {
  const [cohort, setCohort] = useState("")
  const [plain, setPlain] = useState("")
  const [base, setBase] = useState("")
  const [nativeBase, setNativeBase] = useState("")

  return (
    <div className="overflow-hidden rounded-lg border">
      <HeroStage
        image="/hero-placeholder.svg"
        imageFit="contain"
        className="min-h-0 py-8"
        topBar={<AccountChip initials="KS" aria-label="Account: ks@elvtr.com" />}
      >
        <HeroStageCopy>
          <Heading level="display" as="p" className="text-elvtr-dark">
            Good Morning, Sabina!
          </Heading>
          <Text variant="lead">Which cohort needs an intro meeting today?</Text>

          {/* PillCombobox — suggests as you type; the caller supplies matches. */}
          <PillCombobox
            value={cohort}
            onValueChange={setCohort}
            suggestions={DEMO_COHORTS.filter((item) =>
              item.value.toUpperCase().startsWith(cohort.trim().toUpperCase())
            )}
            emptyMessage="No cohort matches that yet."
            placeholder="Start typing a cohort code…"
            aria-label="Cohort code"
          />

          {/* SwatchSelect — a listbox, because option rows carry colour dots. */}
          <div className="flex flex-wrap justify-center gap-3">
            <SwatchSelect
              placeholder="Primary color"
              aria-label="Primary color"
              value={base}
              onValueChange={setBase}
              options={DEMO_BASES}
            />
            <PillSelect
              placeholder="Native select"
              aria-label="Native select"
              value={nativeBase}
              onChange={(event) => setNativeBase(event.target.value)}
              options={DEMO_BASES.map(({ value, label }) => ({ value, label }))}
            />
          </div>

          <PillInput
            value={plain}
            onChange={(event) => setPlain(event.target.value)}
            placeholder="Plain PillInput, no suggestions"
            aria-label="Plain field"
          />

          <DisclaimerCard className="max-w-[680px]">
            No Discord link in Planna Cotta — the deck keeps the template&rsquo;s button.
          </DisclaimerCard>
        </HeroStageCopy>
        <HeroStageActions>
          <ColaButton>Create!</ColaButton>
          <ColaButton disabled>Disabled</ColaButton>
        </HeroStageActions>
      </HeroStage>
    </div>
  )
}

function DemoSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-1.5">
        <Heading level="h2" as="h2">
          {title}
        </Heading>
        {description ? (
          <Text variant="p2" className="max-w-2xl text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------- app */

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Hero — Dark Teal page hero with lime highlight, per brand */}
      <header className="bg-elvtr-dark-teal">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-16">
          <Chip>
            <Sparkles /> ELVTR DESIGN SYSTEM
          </Chip>
          <Heading
            level="hero"
            className="text-[clamp(48px,8vw,120px)] text-elvtr-light"
          >
            ELVTR <span className="text-elvtr-lime">UI Kit</span>
          </Heading>
          <Text variant="p1" className="max-w-xl text-elvtr-light/90">
            React + TypeScript + Tailwind + shadcn/ui foundation carrying the
            ELVTR brand tokens, fonts and icons. First consumer: the Photo
            Booth service screens.
          </Text>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-6 py-14">
        {/* 1. Color tokens */}
        <DemoSection
          title="Color tokens"
          description="Figma style names mapped verbatim to CSS variables and Tailwind utilities (bg-elvtr-*, plus shadcn semantic slots)."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SWATCHES.map((spec) => (
              <Swatch key={spec.cssVar} spec={spec} />
            ))}
          </div>
        </DemoSection>

        {/* 2. Type scale */}
        <DemoSection
          title="Type scale"
          description="Display: ABC Arizona Flare 500 (fallback Georgia). UI/body: Neue Montreal 500 (fallback Inter/Helvetica/Arial). Licensed files go in public/fonts/ — see the README."
        >
          <div className="space-y-8 rounded-lg border bg-elvtr-light p-6">
            <div className="space-y-1 overflow-hidden">
              <Text variant="caption">
                Hero — Arizona Flare 500 · up to 200px / 0.9
              </Text>
              <Heading level="hero" as="p" className="text-[clamp(40px,7vw,96px)]">
                Photo Booth
              </Heading>
            </div>
            <div className="space-y-1">
              <Text variant="caption">H1 — Arizona Flare 500 · 34px / 1.0 · ls -1px</Text>
              <Heading level="h1" as="p">
                Session Details for your cohort
              </Heading>
            </div>
            <div className="space-y-1">
              <Text variant="caption">
                Display — Arizona Flare 500 · 56px / 1.0 · ls -2.24px (Intro
                Meeting screen title; clamps down on narrow viewports)
              </Text>
              <Heading level="display" as="p" className="text-foreground">
                Oops, No Colors Yet!
              </Heading>
            </div>
            <div className="space-y-1">
              <Text variant="caption">
                Lead — Neue Montreal 500 · 24px / 1.2 (line under a display title)
              </Text>
              <Text variant="lead" className="max-w-2xl">
                Which cohort needs an intro meeting today?
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="caption">H3 — Arizona Flare 500 · 22px (tile header)</Text>
              <Heading level="h3" as="p">
                Date &amp; Time
              </Heading>
            </div>
            <div className="space-y-1">
              <Text variant="caption">P2 — Neue Montreal 500 · 16px / 1.2 (body default)</Text>
              <Text variant="p2" className="max-w-2xl">
                Join us for a live walkthrough of the Photo Booth guide. Bring
                your questions — the Student Care team will cover lighting,
                poses and how to export your final shots.
              </Text>
            </div>
          </div>
        </DemoSection>

        {/* 3. Chip */}
        <DemoSection
          title="Chip"
          description="Lime pill with Dark Teal text — the cover-chip treatment. Lime never carries white text."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Chip size="sm">NEW</Chip>
            <Chip>HR MATERIALS</Chip>
            <Chip>
              <Camera /> PHOTO BOOTH
            </Chip>
            <Chip size="lg">Student Care</Chip>
          </div>
        </DemoSection>

        {/* 4. CtaButton */}
        <DemoSection
          title="CtaButton"
          description="Full-width Dark Teal bar with light text — the email primary action."
        >
          <div className="max-w-md space-y-3">
            <CtaButton>
              Join Google Classroom <ArrowUpRight />
            </CtaButton>
            <CtaButton disabled>Registration closed</CtaButton>
          </div>
        </DemoSection>

        {/* 5. DetailTile grid with brand icons */}
        <DemoSection
          title="Session Details tiles"
          description="DetailTile replicates the email info tiles: Alice Blue, 15px radius, vuesax-bulk icon, Arizona Flare 22px header, Neue Montreal 16px body."
        >
          <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailTile icon={<BrandIcon name="calendar" />} label="Date">
              Wednesday, July 16
            </DetailTile>
            <DetailTile icon={<BrandIcon name="clock" />} label="Time">
              2:00 PM EST · 60 minutes
            </DetailTile>
            <DetailTile icon={<BrandIcon name="people" />} label="Hosts">
              ELVTR Student Care team
            </DetailTile>
            <DetailTile icon={<BrandIcon name="text" />} label="Topic">
              HR Materials — Photo Booth walkthrough
            </DetailTile>
          </div>
        </DemoSection>

        {/* 6. SectionTabs */}
        <DemoSection
          title="SectionTabs"
          description="Pill tab-row like the Photo Guide deck navigation. Active pill: Dark Teal with light text."
        >
          <SectionTabs
            defaultValue="overview"
            items={[
              { value: "overview", label: "Overview" },
              { value: "lighting", label: "Lighting" },
              { value: "poses", label: "Poses" },
              { value: "export", label: "Export" },
            ]}
          >
            <SectionTabsContent value="overview">
              <Text className="max-w-2xl">
                The Photo Booth guide walks students through capturing a
                professional headshot with nothing but a phone and a window.
              </Text>
            </SectionTabsContent>
            <SectionTabsContent value="lighting">
              <Text className="max-w-2xl">
                Face the window, keep the light source in front of you, and
                avoid overhead fixtures that cast hard shadows.
              </Text>
            </SectionTabsContent>
            <SectionTabsContent value="poses">
              <Text className="max-w-2xl">
                Shoulders at a slight angle, chin forward and down, eyes to the
                lens. Take ten frames and keep the best two.
              </Text>
            </SectionTabsContent>
            <SectionTabsContent value="export">
              <Text className="max-w-2xl">
                Export at 2048px on the long edge, JPEG quality 90, and upload
                through the Photo Booth service screen.
              </Text>
            </SectionTabsContent>
          </SectionTabs>
        </DemoSection>

        {/* 7. Cola Orange surface */}
        <DemoSection
          title="Cola Orange surface"
          description="The second ELVTR surface (Core Brand Guides 2.0, “Intro Meeting UI”): Mauve page ground, Cream fields, a Cola Orange CTA (Signal ink on Latent ground, 12px radius), the account chip and the Cream disclaimer card. HeroStage is the full-viewport shell; here it is height-capped for the demo."
        >
          <ColaSurfacePreview />
        </DemoSection>

        {/* 8. shadcn base components on brand tokens */}
        <DemoSection
          title="shadcn/ui base"
          description="Stock shadcn components picking up the ELVTR semantic slots: primary = Dark Teal, accent = lime, muted/card = Alice Blue, ring = Dark Teal, radius = 15px."
        >
          <div className="space-y-8">
            <div className="space-y-3">
              <Text variant="caption">Button variants</Text>
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button size="lg">Large</Button>
                <Button size="sm">Small</Button>
              </div>
            </div>

            <div className="space-y-3">
              <Text variant="caption">Badge variants</Text>
              <div className="flex flex-wrap items-center gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Text variant="caption">Card · Input · Label</Text>
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Reserve your slot</CardTitle>
                  <CardDescription>
                    The Photo Booth is open Tuesday to Friday.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Label htmlFor="demo-email">Student email</Label>
                  <Input
                    id="demo-email"
                    type="email"
                    placeholder="you@student.elvtr.com"
                  />
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Request invite</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </DemoSection>

        <footer className="border-t pt-6 pb-10">
          <Text variant="caption">
            Source of truth: ELVTR Figma — Photo-Booth guide
            (4lATmsCWTIPFijqrJ3coMN) and E-mail Student Care
            (GoIYuTuzY350FDmR5UYGrc).
          </Text>
        </footer>
      </main>
    </div>
  )
}
