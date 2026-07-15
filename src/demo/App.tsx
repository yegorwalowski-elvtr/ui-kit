import { useState, type ReactNode } from "react"

import {
  AgreeRow,
  Avatar,
  AvatarStack,
  BentoTile,
  Breadcrumbs,
  CategoryCard,
  CircleCheckbox,
  CourseCard,
  CourseDetailCard,
  DisclosureButton,
  FaqItem,
  Hairline,
  InfoCard,
  MetaChip,
  PersonRow,
  PhoneField,
  PixelDecor,
  RatingScoreCard,
  RatingStars,
  SearchBar,
  SectionHeader,
  SeeAllCoursesCard,
  SiteButton,
  SiteSwitch,
  StatPair,
  StoryCard,
  SyllabusRow,
  Tag,
  TestimonialCard,
  TooltipBubble,
  TrustpilotBadge,
  UnderlineField,
} from "../v2"
import { BrandIcon } from "../index"

/*
 * All-components showcase for the 2026 redesign system.
 * One page, grouped Foundations → Atoms → Forms → Molecules → Organisms,
 * with a live category-theme switcher (data-theme on <html>).
 */

const THEMES = ["green", "teal", "terracotta", "violet"] as const
type Theme = (typeof THEMES)[number]

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-8 border-b border-line pb-16">
      <div className="flex flex-col gap-2">
        <h2 className="t-h3 text-ink">{title}</h2>
        {note && <p className="t-body-md max-w-[720px] text-muted-warm">{note}</p>}
      </div>
      {children}
    </section>
  )
}

function Cluster({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="t-body-sm tracking-wide text-faint uppercase">{label}</span>
      <div className="flex flex-wrap items-end gap-4">{children}</div>
    </div>
  )
}

const NEUTRALS: Array<[string, string, string]> = [
  ["ink", "#21180D", "headlines, control labels"],
  ["ink-cool", "#0E081E", "Figma Grayscale/100 — reconcile"],
  ["body", "#393939", "body copy"],
  ["dim", "#3C3C3C", "text on tints"],
  ["muted", "#5A5A5A", "secondary text"],
  ["faint", "#A3A3A3", "placeholders"],
  ["page", "#F3F3F3", "page bands"],
  ["control", "#F9F9F9", "raised controls"],
  ["panel", "#F5F5F5", "panels"],
  ["strip", "#E6E6E6", "footer band"],
  ["neutral-btn", "#DCDCDE", "neutral buttons"],
  ["error", "#EB4335", "form errors"],
]

const TYPE_RAMP: Array<[string, string, string]> = [
  ["t-h1", "H1 Headline", "AF 442 · 80/0.9 · −4%"],
  ["t-h2", "H2 Headline", "AF 442 · 60/0.9 · −4%"],
  ["t-h3", "H3 Headline", "AF 442 · 40/0.9 · −4%"],
  ["t-h4", "H4 Headline", "AF 571 · 32/0.9 · −4%"],
  ["t-h5", "H5 Headline", "AF 571 · 24/1.0 · −4% · capitalize"],
  ["t-h6", "H6 Headline", "AF 571 · 20/1.0 · −4%"],
  ["t-body-lg", "Body Large", "NM 500 · 20/1.1"],
  ["t-body-md", "Body Medium", "NM 500 · 16/1.3 · −2%"],
  ["t-body-sm", "Body Small", "NM 500 · 12/1.0 · −2%"],
  ["t-button-1", "Button 1", "NM 500 · 14/1.2"],
  ["t-button-2", "Button 2", "AF 571 · 14/1.1 · −4%"],
]

export default function App() {
  const [theme, setTheme] = useState<Theme>("green")

  return (
    <div data-theme={theme} className="min-h-screen bg-page pb-24 font-sans text-ink">
      {/* Header / theme switcher */}
      <header className="sticky top-0 z-10 border-b border-line bg-page/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1286px] flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-ink px-2 py-1 font-display text-xl text-white">|e|</span>
            <div className="flex flex-col">
              <span className="t-h6">ELVTR UI · 2026 system</span>
              <span className="t-body-sm text-muted-warm">all components · docs/DESIGN-SYSTEM-PLAN.md</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="t-body-sm mr-1 text-muted-warm">category theme:</span>
            {THEMES.map((t) => (
              <SiteButton key={t} variant="nav" size="sm" active={theme === t} onClick={() => setTheme(t)}>
                <span
                  className="mr-1 inline-block size-3 rounded-full"
                  style={{ background: { green: "#018362", teal: "#038892", terracotta: "#D05A36", violet: "#574791" }[t] }}
                />
                {t}
              </SiteButton>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1286px] flex-col gap-16 px-6 pt-12">
        {/* ------------------------------------------------ Foundations */}
        <Section
          id="foundations"
          title="Foundations"
          note="Extracted verbatim from Figma. Licensed ABC Arizona Flare / Neue Montreal woff2 files are not in the repo yet — headings render in the serif fallback until they're dropped into public/fonts/."
        >
          <Cluster label="Category accent (switch themes above)">
            <div className="flex flex-col items-center gap-1">
              <div className="size-16 rounded-2xl bg-accent-600" />
              <span className="t-body-sm text-muted-warm">accent-600</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-16 rounded-2xl bg-accent-pressed" />
              <span className="t-body-sm text-muted-warm">pressed</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-16 rounded-2xl bg-accent-300" />
              <span className="t-body-sm text-muted-warm">accent-300</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-16 rounded-2xl bg-accent-100" />
              <span className="t-body-sm text-muted-warm">accent-100</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="bg-accent-band size-16 rounded-2xl" />
              <span className="t-body-sm text-muted-warm">gradient band</span>
            </div>
          </Cluster>
          <Cluster label="Neutrals & semantic">
            {NEUTRALS.map(([name, hex, use]) => (
              <div key={name} className="flex w-24 flex-col gap-1">
                <div className="h-12 w-full rounded-lg border border-line" style={{ background: hex }} />
                <span className="t-body-sm text-ink">{name}</span>
                <span className="t-body-sm text-faint">
                  {hex} · {use}
                </span>
              </div>
            ))}
          </Cluster>
          <Cluster label="Type ramp">
            <div className="flex w-full flex-col gap-4">
              {TYPE_RAMP.map(([cls, label, spec]) => (
                <div key={cls} className="flex items-baseline gap-6">
                  <span className={`${cls} text-ink`}>{label}</span>
                  <span className="t-body-sm whitespace-nowrap text-faint">{spec}</span>
                </div>
              ))}
            </div>
          </Cluster>
          <Cluster label="Brand pixel decor">
            <PixelDecor />
            <PixelDecor color="var(--accent-600)" cells={[[0, 1], [1, 1], [1, 0], [2, 0], [3, 1]]} />
          </Cluster>
        </Section>

        {/* ------------------------------------------------ Buttons */}
        <Section
          id="buttons"
          title="Buttons"
          note="cta/tint follow the category theme; hover = gradient + solid white border, pressed = bright fill (per Figma). Disabled/focus states are standardized — not drawn in Figma."
        >
          <Cluster label="CTA (Big buttons · Color pair)">
            <SiteButton size="xl">Apply Now</SiteButton>
            <SiteButton size="lg">More</SiteButton>
            <SiteButton size="sm">Apply now</SiteButton>
            <SiteButton size="xl" variant="tint">
              Learn More
            </SiteButton>
            <SiteButton size="lg" disabled>
              Disabled
            </SiteButton>
          </Cluster>
          <Cluster label="Nav pills (Small buttons)">
            <nav className="flex items-center gap-2">
              <SiteButton variant="nav" size="sm" active>
                Home
              </SiteButton>
              <SiteButton variant="nav" size="sm">
                Courses
              </SiteButton>
              <SiteButton variant="nav" size="sm">
                About Us
              </SiteButton>
              <SiteButton variant="nav" size="sm">
                Blog
              </SiteButton>
              <SiteButton variant="nav" size="sm">
                Reviews
              </SiteButton>
              <SiteButton variant="nav" size="sm">
                🇺🇦
              </SiteButton>
            </nav>
          </Cluster>
          <Cluster label="Neutral / profile links / disclosure">
            <SiteButton variant="neutral" size="lg">
              Show More
            </SiteButton>
            <SiteButton variant="link" size="md">
              <span className="text-linkedin-blue">in</span> LinkedIn
            </SiteButton>
            <SiteButton variant="link" size="md">
              💼 Portfolio
            </SiteButton>
            <DisclosureButton aria-label="Expand" />
            <DisclosureButton open aria-label="Collapse" />
            <DisclosureButton size="big" />
            <DisclosureButton size="big" open />
          </Cluster>
        </Section>

        {/* ------------------------------------------------ Forms */}
        <Section
          id="forms"
          title="Forms"
          note="Underline fields with floating labels (Form State), circular consent checkbox (Agree state), catalog switch and mobile search+filter."
        >
          <div className="grid max-w-[1166px] grid-cols-1 gap-10 rounded-3xl bg-white p-10 md:grid-cols-2">
            <UnderlineField label="Name" />
            <UnderlineField label="Email" defaultValue="anna@elvtr.com" />
            <PhoneField />
            <UnderlineField label="Email" error="Error message" defaultValue="anna@" />
            <AgreeRow defaultChecked>
              I agree to receive text messages from ELVTR at the phone number provided.
            </AgreeRow>
            <AgreeRow error>I agree to the Terms of Use and Privacy Policy.</AgreeRow>
            <div className="flex items-center gap-6">
              <CircleCheckbox defaultChecked aria-label="checked" />
              <CircleCheckbox aria-label="empty" />
              <CircleCheckbox error aria-label="error" />
              <CircleCheckbox size="mobile" defaultChecked aria-label="mobile checked" />
              <label className="t-button-1 flex items-center gap-2 text-ink">
                <SiteSwitch defaultChecked /> Show past courses
              </label>
            </div>
            <SearchBar />
          </div>
        </Section>

        {/* ------------------------------------------------ Rating & people */}
        <Section id="rating" title="Rating & people">
          <Cluster label="Stars (plain / boxed / fraction) + Trustpilot badge">
            <RatingStars value={5} />
            <RatingStars value={3.6} />
            <RatingStars value={4.5} variant="boxed" />
            <RatingStars value={4.5} variant="boxed" size={14} />
            <TrustpilotBadge />
          </Cluster>
          <Cluster label="Review-source score cards">
            <RatingScoreCard score={4.7} reviews={532} source="Trustpilot" trustpilot />
            <RatingScoreCard score={4.5} reviews={101} source="Google" />
            <RatingScoreCard score={4.7} reviews={51} source="Facebook" />
          </Cluster>
          <Cluster label="Avatars / stack / person rows">
            <Avatar name="Bruno Olivera" />
            <Avatar name="Anna Jones" shape="circle" size={40} ring />
            <AvatarStack names={["Ada L", "Mia K", "Tom B", "Ira D"]} counter="+13" />
            <PersonRow name="Chey Brown" role="Position" linkedin />
            <PersonRow name="Anna Jones" role="Costume Design course" photo={false} />
          </Cluster>
          <Cluster label="Stats">
            <StatPair value="1050+" label="Graduates" />
            <StatPair value="95%" label="Positive Feedback" />
            <div className="bg-accent-band flex gap-8 rounded-2xl p-6">
              <StatPair value="97+" label="Industry Experts" onDark />
            </div>
          </Cluster>
        </Section>

        {/* ------------------------------------------------ Tags & chips */}
        <Section id="tags" title="Tags & chips">
          <Cluster label="Status tags (Tags 17968:18810)">
            <Tag status="bestseller">🏆 Best Seller</Tag>
            <Tag status="lastcall">⏳ Last call</Tag>
            <Tag status="new">✨ New course</Tag>
            <Tag status="relaunch">🔄 Relaunch</Tag>
            <Tag status="neutral">Career Preparation</Tag>
            <Tag status="themed">Live online course</Tag>
          </Cluster>
          <Cluster label="Syllabus meta chips">
            <MetaChip>
              <BrandIcon name="calendar" /> Wed (3/18)
            </MetaChip>
            <MetaChip>
              <BrandIcon name="clock" /> 5:30 PM GMT
            </MetaChip>
            <MetaChip themed>Assignment</MetaChip>
          </Cluster>
          <Cluster label="Breadcrumbs / tooltip / hairline">
            <Breadcrumbs items={["Home", "Courses", "AI Engineer"]} />
            <TooltipBubble>Join us in supporting the people of Ukraine</TooltipBubble>
            <Hairline className="w-40 self-center" />
          </Cluster>
        </Section>

        {/* ------------------------------------------------ Cards */}
        <Section
          id="cards"
          title="Cards & tiles"
          note="Photo/3D assets are not bundled — gradient and emoji placeholders stand in; the app supplies real imagery."
        >
          <Cluster label="Course cards + see-all (hover reveals instructor)">
            <CourseCard
              title="Sound Design for Film"
              instructor="Luke Gibbson"
              role="Sound designer & editor"
              status="bestseller"
              meta="2025"
            />
            <CourseCard
              title="Sneaker Design"
              instructor="Morgan Stauffer"
              role="Ex-senior Creative Director at Nike"
              status="new"
              photoClass="bg-[linear-gradient(160deg,#144b41,#0c1f1b)]"
              titleClass="font-display text-[26px] italic"
            />
            <CourseCard
              title="Sport Psychology"
              instructor="Emily Dais"
              status="lastcall"
              meta="7 seats left"
              photoClass="bg-[linear-gradient(160deg,#5a3b73,#241236)]"
            />
            <SeeAllCoursesCard />
          </Cluster>
          <Cluster label="Course hero details / info tiles">
            <CourseDetailCard
              icon={<BrandIcon name="calendar" />}
              title="Dates:"
              rows={[
                ["Start", "Mar 18"],
                ["End", "May 27"],
              ]}
            />
            <CourseDetailCard
              icon={<BrandIcon name="clock" />}
              title="Time"
              rows={[
                ["Tue & Thu", "6 PM PT"],
                ["Live", "Online"],
              ]}
            />
            <InfoCard title="Has an impressive 26 years of experience" className="max-w-[420px]">
              Director of Production at Penguin Random House; previously led narrative teams at Blizzard.
            </InfoCard>
          </Cluster>
          <Cluster label="Category / bento">
            <CategoryCard
              title="Gaming"
              description="Find your niche in the industry, work on game-related projects."
              art="🎮"
              className="max-w-[416px]"
            />
            <BentoTile title="100% Live online classes" tone="lavender" icon="💻" wide className="w-[520px]" />
            <BentoTile title="Community Discussion" tone="mint" icon="💬" className="w-[254px]" />
            <BentoTile title="Certificate of Achievement" tone="cream" icon="📜" className="w-[254px]" />
          </Cluster>
          <Cluster label="Testimonials / stories">
            <TestimonialCard
              rating={4.8}
              course="Game Writing"
              quote="Elevating data science skills to business impact — the course gave me exactly the tools my studio needed."
              name="Chey Brown"
              role="Narrative Designer"
            />
            <StoryCard title="Elevating Data Science Skills" category="Data Science in Finance" cta="Chey Brown's Success story" />
          </Cluster>
        </Section>

        {/* ------------------------------------------------ Accordions */}
        <Section id="accordions" title="Accordions" note="FAQ + syllabus rows; open state takes the category tint.">
          <div className="flex flex-col gap-3">
            <FaqItem question="Do I need prior experience?" defaultOpen>
              No — the course starts from fundamentals and ramps to production-grade projects with weekly
              instructor feedback.
            </FaqItem>
            <FaqItem question="What happens if I miss a live session?" />
            <SyllabusRow
              number="01"
              title="Introduction to the industry"
              meta={["Wed (3/18)", "5:30 PM GMT"]}
              lessonType="Workshop"
              bullets={["Map the current market landscape", "Set up your toolchain"]}
              defaultOpen
            >
              Kick-off session: expectations, tools and the final-project brief.
            </SyllabusRow>
            <SyllabusRow number="02" title="Research and references" meta={["Thu (3/19)", "5:30 PM GMT"]} />
          </div>
        </Section>

        {/* ------------------------------------------------ Section header demo */}
        <Section id="patterns" title="Section pattern">
          <SectionHeader
            title="Trusted, Admired & Loved"
            subtitle="ELVTR courses offer 100% instructor driven content designed to give you practical knowledge."
            action={<SiteButton size="lg">More</SiteButton>}
          />
        </Section>

        <footer className="t-body-sm flex flex-col gap-1 text-faint">
          <span>@elvtr/ui-kit · v2 preview · tokens: src/styles/theme-2026.css · spec: docs/DESIGN-SYSTEM-PLAN.md</span>
          <span>Legacy Photo-Booth components remain exported from the package root; this page shows the 2026 set.</span>
        </footer>
      </main>
    </div>
  )
}
