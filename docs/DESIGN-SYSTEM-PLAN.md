# ELVTR UI Design System — Full Plan

**Scope:** the design system for the elvtr.com redesign (Figma: *New Website* → canvas *2026 drafts Y*,
`KXbrrLqsosb4KEQLKwYDT9`, node `17968-4205`) plus the internal surfaces that follow it (student portal / LMS,
checkout). Written 2026-07-15 from a full audit of the Figma canvas (every artboard and component sheet),
a crawl of the production site, and a survey of the current frontend ecosystem.

**TL;DR recommendation:** keep the existing `@elvtr/ui-kit` architecture (source-exported Tailwind v4 +
shadcn-style components), but re-initialize it on **shadcn/ui over Base UI primitives, React 19.2, Next.js 16**,
in a **pnpm + Turborepo monorepo** (`packages/ui`, `apps/marketing`, later `apps/portal`). Replace the old
Photo-Booth (teal/lime) token file with the redesign tokens documented below, and build the component
inventory in the phase order in §8. Motion: **Motion (ex-framer-motion) for component micro-interactions,
GSAP (now fully free) for scroll set-pieces, View Transitions (via `next-view-transitions`) for page-to-page
navigation, Embla for carousels.**

---

## 1. What was analyzed

| Source | Contents |
| --- | --- |
| Figma canvas `2026 drafts Y` (69 top-level nodes, all covered) | Main Page (1366 + 375), Course List (1366 + 375), Course Page ("Decktop") at 1920/1440/1366/768/375, mobile Menu drawer, fixed mobile CTA, and component sheets: Small/Big/Link/"Sullabus" buttons, Icons, Form State, Agree state, Tags, Card Hover/Hover, Card label/description, Gradients ×4, Testimonial, Rate, Testimonial info, Profile, Instructor info, Filter + search, Fonts, Color pair, Stand with UA, OG_img, Components 3/6/7/8/9/10, 14 hero draft iterations, F1/F2 pixel boards |
| elvtr.com production crawl | Full IA (~40 course pages, catalog, reviews, blog, about, careers, success stories, legal), enrollment funnel (`meeting.elvtr.com`, Fillout survey, `pay.elvtr.com`), LMS evidence (certificates, Vimeo recordings, community hub) |
| Existing repos | `ui-kit` (shadcn + Tailwind v4 scaffold themed for Photo Booth), `new-website` (empty, greenfield) |

Coverage was adversarially verified against the canvas XML: every top-level frame is accounted for; the one
organism the first pass missed (footer **newsletter signup**, present only at ≥768px) is included below.

---

## 2. The design language (what the Figma actually says)

Light, editorial, premium: near-black warm ink on `#F3F3F3`/white bands, serif display type
(**ABC Arizona Flare**, weights 442/571, −4% tracking, 0.9 line-height), sans UI type (**Neue Montreal** 500),
big photography, pastel accent surfaces, and a pixel-cluster brand decoration motif.

### 2.1 Category theming — the central architectural finding

The three "Decktop" breakpoint artboards are painted in **three different accent themes** (green / terracotta /
violet; tablet adds teal), and the "Color pair" sheet encodes exactly four **solid + tint pairs**. Course pages,
CTAs, tags, syllabus/FAQ expanded rows, gradients and bento tiles all swap accents per **course category** while
every neutral stays constant. The design system must therefore ship a **theme-token layer** (CSS custom
properties swapped by a `data-theme="green|teal|terracotta|violet"` attribute), not per-component colors.

| Theme slot | Green (default/brand) | Teal | Terracotta | Violet |
| --- | --- | --- | --- | --- |
| `accent-600` (solid CTA, checkbox, expanded controls) | `#018362` | `#038892` | `#D05A36` | `#574791` |
| `accent-pressed` | `#17C297` | `#1BB5C1` | `#FF7A51` | `#7250EB` |
| `accent-hover` (gradient → bright over base) | `#27BD97` | `#1BB5C1` | `#FF7A51` | `#7250EB` |
| `accent-100` (tint: secondary button, expanded rows) | `#B1D7CD` / `#D9EDEE` | `#C4ECEF` | `#F7F0E2` | `#EAEDFF` |
| `accent-300` (chips, lesson numbers) | `#95C9CC` | — | — | — |
| Section gradient (3 blurred ellipses) | `#003F32→#018362` | `#04636A→#22AEB7` | `#AB5034→#DB7151` | `#412F7B→#6754A9` |

Pairing rules (hard rules from the "Color pair" sheet): **white text only on the 4 solids; dark `#3C3C3C` text
only on tints/light surfaces.** Green `#018362` doubles as the global success/focus semantic in forms
regardless of theme.

### 2.2 Signature styles (used on virtually everything)

- **Frosted border:** `2px rgba(255,255,255,0.4)` on every filled control; upgrades to solid `#FFF` on hover.
- **Control shadow:** `0 4 10 rgba(14,18,27,0.10)` on raised light controls; `0 1 2 rgba(0,0,0,0.05)` (token `shadow/neutral/sm`) on tiny controls.
- **Radius scale:** 8 (nav pills) · 10 (inputs/chips) · 12 (tags, tooltips, testimonials, square avatars, mobile cards) · 14 (primary CTA, mobile tiles) · 16 (cards, panels, accordions) · 20 (bento, lesson rows, XL CTA) · 24 (photo/course cards, form card) · full (pills, round avatars).
- **Blur scrims:** course-card overlays use `backdrop-blur 7.5px` + tinted gradient to near-black; label bands use dual accent gradients.
- **Pixel decor:** 28–29px rounded-square clusters (`#00B67A` bright / `#018362` dark / gradient / muted) flanking heroes — saved as components (6–10, F1/F2) with appear/dissolve animation keyframes.
- **Section rhythm:** 60px top padding (32 mobile), 48px header→content gap; content column 1286px @1366 (40px margins), 1360 @1440, **capped ~1440 @1920**; 728px @768 (20px), 344px @375 (16px).

### 2.3 Design-debt flags to resolve with the design team

1. **Two inks:** headlines/buttons use warm `#21180D` everywhere, but the tokenized `Grayscale/100` is `#0E081E`. Pick one (recommend `#21180D` as `--color-ink`, keep `#0E081E` as alias until reconciled).
2. **`primary-base #335CFF`** is defined as a Figma variable but appears nowhere in the shipped artboards (everything is green). Confirm whether blue is dead or reserved (e.g. for the portal).
3. **Font licensing:** the file literally uses "ABC Arizona Flare Variable **Unlicensed Trial**". Production needs the licensed Dinamo cut (variable axis covering weights 442 + 571) before launch.
4. Accent colors are **raw hex in Figma, not variables** — tokenizing them in code (this plan) should be mirrored back into Figma variables.
5. **Undesigned but required:** cookie-consent banner (legal copy references it 3×), form success/thank-you state, disabled/focus-visible/loading states for all controls, input hover, dark-section variants (one dark `#1F1F1F` course-grid exploration exists), desktop catalog search, drawer/accordion motion specs.

---

## 3. Foundation tokens

### 3.1 Color primitives

```
Ink & text        #21180D ink (warm near-black; headlines, labels)   #0E081E grayscale-100 (token, reconcile)
                  #282828 #393939 #3C3C3C body/secondary             #5A5A5A / #5A5A58 (grey-35) muted
                  #595959 meta   #787878 subtle   #A3A3A3 placeholder  #A6A6A6 breadcrumb-past  #A6A4A2 muted-display
Surfaces          #FFFFFF  #F9F9F9 control  #F5F5F5 panel  #F3F3F3 page  #E6E6E6 header-strip
                  #ECECEC / #E9E9E9 / #DCDCDC dividers   #DCDCDE / #D4D4D4 neutral-button  #C9C9C9 ghost-numeral
Dark surfaces     #1F1F1F dark-band   #0F0F0F / #121212 card scrims   #352214 (photo-tinted scrim example)
Semantic          success/focus #018362   error #EB4335   switch-on #17C964   emerald token #07A188
3rd-party         Trustpilot #00B67A   LinkedIn #0A66C2   UA flag #0057B7 + #FFD700
Status tags       BestSeller #F7E1BA/#D3911F (card band: rgba(228,213,51,.8) + border #F3FF64)
                  LastCall  #FFCBE4/#C04589 (card band: rgba(196,45,131,.8) + #FB98C7)
                  NewCourse #CDEFD1/#3E8C4B (card band: rgba(64,188,87,.8) + #B4FB98)
                  Relaunch  #E2D9FF/#674EBB (card band: rgba(125,90,247,.8) + #B8A0FF)
                  Basic     #E7E4E4/#282828
Social tiles      mail #F7F0E2   instagram #FFEDF9   facebook #E2E8FF
Misc              avatar-counter #67B5A1   avatar-placeholder #D0C9CE   empty boxed star #DCDCE6
                  highlight-pill sage #ABD2C8   pixel gradient #44A289   hero tints #DAECED #DCEEEF #E2EFEF
```

Plus the four category theme palettes in §2.1. Scrim for drawers/modals: `rgba(33,24,13,0.5)`.

### 3.2 Typography

Families: `--font-display: "ABC Arizona Flare"` (variable; 442 "Regular", 571 "Medium"; licensed cut required)
· `--font-sans: "Neue Montreal"` (Medium 500). All AF styles track −4%, NM Body M/S track −2%.

| Token | Face | Size/LH | Notes |
| --- | --- | --- | --- |
| H1 | AF 442 | 80 / 0.9 | course-page hero title |
| H2 | AF 442 | 60 / 0.9 | section headers, home hero |
| H3 | AF 442 | 40 / 0.9 | mobile hero/headers, OG title |
| H4 | AF 571 | 32 / 0.9 | card titles, see-all card |
| H5 | AF 571 | 24 / 1.0 | info-card titles (`capitalize`) |
| H6 | AF 571 | 20 / 1.0 | card/CTA label face |
| Body Large | NM 500 | 20 / 1.1 | lead paragraphs, desktop inputs |
| Body Medium | NM 500 | 16 / 1.3 | body copy, mobile inputs |
| Body Small | NM 500 | 12 / 1.0 | meta, roles, legal |
| Button 1 | NM 500 | 14 / 1.2 | nav pills, small buttons |
| Button 2 | AF 571 | 14 / 1.1 | tags, mobile link buttons |
| Button XL | AF 571 | 24–28 / 1.0 | large CTA labels (unnamed in Figma) |

Special: per-course **display faces** on course-card titles (e.g. 'Average' 34px, script/neon faces per
vertical) — treat as an art-directed, per-course asset (curated font list or pre-rendered), *not* a system token.

### 3.3 Other scales

- **Spacing:** 4 · 8 · 10 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 60.
- **Radii / borders / shadows:** §2.2. Universal stroke = 2px (scales ~1.43px on mobile controls).
- **Breakpoints:** 375 (16px margins) · 768 (20px) · 1366 (40px) · 1440 (content max) · 1920 (centered, ~240px margins). Type does **not** scale between desktop widths — only the container.
- **Mobile scaling rule:** forms drop one type step (20→16, 16→14), controls scale ×0.714, radii step down one notch (16→14, 24→12/14), paddings tighten ~2–4px.
- **Icons:** **vuesax "bulk"** duotone at 20px (controls) / 24px (menus) — game, crown, command, pen-tool, calendar-2, clock, timer, teacher, sms, sms-star, notification-status, note, monitor, messages-2, clipboard-text, tick-circle…; plus Remix `bard-fill` (AI), `trophy-fill` (best-seller chips), vuesax **bold** `sms` (newsletter submit), the universal 12×7 chevron vector, brand glyphs (LinkedIn, Wikipedia, UA heart). Extends the kit's existing `BrandIcon` set.
- **Motion tokens:** durations/easings are *not* specified in Figma — propose: micro 150ms / control 250ms / section 400ms, `ease-out-quart`; accordion height + color 250ms; drawer slide-in-left 300ms + scrim fade; marquee ~30s linear loop; hero pixel appear/dissolve per Component 7–10 keyframes; page transitions via View Transitions (~250ms cross-fade + shared-element on course card → course hero). Always respect `prefers-reduced-motion`.

---

## 4. Component inventory — atoms → templates

Legend: **[Fig]** = drawn in Figma (node ref) · **[Site]** = exists on elvtr.com, undrawn · **[Ant]** = anticipated.
Base column: what to build it on (shadcn/Base UI component, or custom). Priority: P0 = needed for the three
designed pages; P1 = needed for site parity; P2 = portal/later.

### 4.1 Atoms

| Component | Spec highlights | Figma | Base | Pri |
| --- | --- | --- | --- | --- |
| `Button` variant **cta** (sizes xl 284×72 r14/20 · lg ~143×56 r14 · md 208×56 · sm 94×34) | themed solid, AF label 20–28, frosted border, hover gradient + white border, pressed color | 17968:17291, 12759 | shadcn Button + CVA | P0 |
| `Button` variant **secondary/tint** | accent-100 bg, `#3C3C3C` text, same geometry | 12759 | 〃 | P0 |
| `Button` variant **nav-sm** (h34, r8, px10 py8) | transparent → hover `rgba(249,249,249,.3)` → active `#F9F9F9` + white border + shadow; optional 20px icon | 17968:17165 | 〃 | P0 |
| `Button` variant **neutral** ("Show More" 158×52 / pill 109×34 scroll-up) | `#DCDCDE`/`#D4D4D4` bg, `#3C3C3C` text | 17968:17937 | 〃 | P0 |
| `Button` variant **link-profile** (239×44 desktop / 98×36 mobile, r10) | `#F9F9F9` bg, brand icon 24/20, AF label | 17968:18848 | 〃 | P0 |
| `DisclosureButton` (52×39 icon pill; grey chevron-down ↔ themed circle chevron-up) | accordion toggle atom | 17968:17937 | custom | P0 |
| `Input` (underline field, 56px desktop / 49 mobile) | 2px bottom border `#A3A3A3`→`#018362` (focus)→`#EB4335` (error); floating 12px label; value BL/BM | 17968:18365 | Base UI Field/Input restyled | P0 |
| `PhoneField` (75px country segment + input) | flag 24 + dial code; country dropdown panel 296×176, rows h40, dividers `#E9E9E9` | 17968:18735 | Base UI Select + custom | P0 |
| `Checkbox` (28px desktop / 20 mobile, circular) | checked `#018362` + white tick-circle icon; empty `#D4D4D4`; error 2px `#EB4335` ring | 17968:18386 | Base UI Checkbox | P0 |
| `Switch` (40×24, thumb 16) | on `#17C964`, `shadow/neutral/sm` | course-list sidebar | Base UI Switch | P0 |
| `SearchInput` (h40, r10, `#F9F9F9`, 2px white border, shadow) | magnifier 12px, placeholder `#A0A0A0` | 17968:18671 | Input composite | P0 |
| `Tag` (h35, r12, px16 py10, icon 15, AF 14) | 5 colorways (§3.1 status tags) + neutral | 17968:18810 | shadcn Badge + CVA | P0 |
| `MetaChip` (white pill h31, r10, icon 16 + NM 12 `#5A5A5A`) | syllabus date/time chips; themed variant `#95C9CC` white text | syllabus rows | Badge | P0 |
| `Star` / `RatingStars` | 14/20px; plain + Trustpilot-boxed; fraction = width-mask overlay | 17968:18107 | custom | P0 |
| `Avatar` (circle 40/48 w/ 2px white ring · **square r12 44px**) | photo, placeholder `#D0C9CE` | 17968:18136 | shadcn Avatar | P0 |
| `Divider` (1px `#E6E6E6`/`#ECECEC`) | hairlines under H5s, in tiles | everywhere | custom | P0 |
| `Tooltip` (white, r12, px16 py8, NM 14, caret) | from Stand-with-UA hover | 17968:17181 | Base UI Tooltip | P1 |
| `UAHeartButton` (39.6×34) | split `#0057B7`/`#FFD700` heart + tooltip | 17968:17181 | IconButton | P0 |
| `Logo` (\|e\| mark 37×32; full wordmark 56×17) | header/footer/OG | all navs | asset | P0 |
| `PixelDecor` | 28px rounded-square clusters, 4 colorways, animation keyframes | Comp 6–10, F1/F2 | custom (SVG/CSS) | P1 |
| `Chevron` (12×7 vector, rotated) | single asset reused everywhere | all | asset | P0 |
| `Spinner`/`Skeleton`, focus-ring style, `Toast` | undrawn; standardize | — | shadcn | P1 |

### 4.2 Molecules

| Component | Spec highlights | Figma | Pri |
| --- | --- | --- | --- |
| `TrustpilotBadge` (white pill r-full, px20 py10; 14px boxed stars + "4.9 Trustpilot" NM 14) | hero + compact borderless variant | 17991:23747 | P0 |
| `RatingScoreCard` (400×96 / mobile h90, white r14–16: AF-40 score · divider · stars + "532 reviews on {logo}") | Trustpilot/Google/Facebook variants | 17968:7990 | P0 |
| `PersonRow` (`Profile`) | avatar sq-12 + name (+LinkedIn 16) + role; 8 variants | 17968:18136 | P0 |
| `QuoteInline` / `QuoteCard` | hero proof quote + attribution; mobile card variant | drafts, 13397 | P0 |
| `StatPair` / `StatBlock` | AF 32–40 number (accent or white) + NM label | 18101:4036, lead form | P0 |
| `CourseDetailCard` (184×142 white r16 desktop) / `CourseDetailRow` (mobile h52 r14) | icon + H6 + hairline + label/value rows | 17968:7928 | P0 |
| `InfoCard` (`Instructor info`) | `#F3F3F3` r16/14, p32/p24-20, H5 + hairline + body; Title on/off, desktop/mobile | 17968:18444 | P0 |
| `Breadcrumbs` (NM 14; past `#A6A6A6`, current `#282828`, chevron sep) | | course/catalog | P0 |
| `AvatarStack` (48px circles, −22 overlap, `+13` counter `#67B5A1`) | | 17968:18869 | P0 |
| `FilterSearchBar` (344×40: SearchInput + 44×40 themed filter icon-button; dropdown panel w/ Theme + Date chip groups) | mobile catalog filter | 17968:18671 | P0 |
| `CategoryListItem` (sidebar pill: icon 20 + NM 14; selected = active-pill style) | desktop catalog sidebar | 14097 | P0 |
| `SortPill` ("Date: Upcoming") | dropdown undrawn — standardize | 14097 | P0 |
| `FormField` group (Input + label + error), `AgreeCheckbox` row (gap 16) | error turns text+control red | 18365/18386 | P0 |
| `NewsletterSignup` (email inline field + 55×50 arrow/sms CTA + decor tile) — **≥768px footers only** | the organism the first pass missed | 17968:9676 etc. | P1 |
| `SocialIconTile` (36×36 r8, pastel bg + 20px glyph) | mail/IG/FB | footers | P0 |
| `LanguagePill`, `PromoBanner` | [Site] top promo bar | — | P1 |

### 4.3 Organisms

| Organism | Anatomy / behavior | Figma | Pri |
| --- | --- | --- | --- |
| `SiteHeader` (58px desktop / 50 mobile) | logo · 6 nav-sm pills · UAHeartButton · (course pages) Apply-now sm CTA; mobile: Menu pill; sticky | 17968:6697 | P0 |
| `MobileNavDrawer` (228px left drawer over scrim) | close, course H4, 5 anchor pills w/ scrollspy (active = tint; Apply = solid), site nav, socials; slide-in | 17968:16985 | P0 |
| `StickyCtaBar` (mobile 344×56 CTA floating 16px above browser chrome) | appears when hero CTA scrolls off | 17968:16824 | P0 |
| `CourseCard` (254×352 desktop r24 / 166×235 mobile r12) | photo + blurred-copy layering; `CardLabel` status band (4 themed variants); `CardDescription` blur-scrim block (title AF/art-face, hairline, instructor, optional logo); hover reveals instructor + darkens scrim | 18835/18869/18457/18490 | P0 |
| `SeeAllCoursesCard` (254×352 / mobile bar 344×72) | accent bg, H4 white, AvatarStack | 17968:18869 | P0 |
| `CourseGrid` | 5×2 home (8px gutters) / 4×3 catalog / 2-col 12px mobile; `PastCoursesCard` cell; load-more `More` CTA (mobile) | multiple | P0 |
| `CategoryCard` + grid (416×275, 3×2 / 2-col mobile) | H4 + BM description + 3D render | 17968:5676 | P0 |
| `StoryCard` carousel (274×433, pastel bg, notch-masked photo, accent CTA bar; mobile recolored solid variant) | edge-fade overflow carousel | 17968:5711 | P0 |
| `TestimonialCard` + masonry (304/312px, slot-based: Rate/Info/Profile; 4-col masonry 12px, fade + More) | | 18105–18136, 8891 | P0 |
| `LogoMarquee` (12 mono logos, 88px cells desktop / 40px mobile, infinite scroll) | | 5711, lead form | P0 |
| `BentoGrid` (rows [628·310·310]+[310·310·628]×232, 10px; uniform 2-col mobile) | pastel tiles, 3D icons, H4/H6 | 17968:5838 | P0 |
| `BlogCard` + row (302×287, image r8 + shine-sweep hover, H5, meta w/ ✦ separator) | | 17968:6493 | P0 |
| `SectionHeader` (H2 + Body-Large sub · optional right CTA) | universal band, 48px gap | all | P0 |
| `HeroHome` (Trustpilot badge · H2 60 · hairline · quote; PixelDecor keyframes; hidden stats column variant; draft variants: accent words, highlight pills, mission card, Get-Started CTA) | | 17991:23743, drafts | P0 |
| `HeroCourse` (tags · H1 80 · 3 DetailCards · CTA pair · InstructorHeroCard 462–518×584 photo card w/ scrim caption + logo) | | 17968:7928 | P0 |
| `CourseInfoBand` (tint panel + accent panel with **notched "castle-tab" edge** + 3 RatingScoreCards) | | 17968:7990 | P0 |
| `SyllabusAccordion` (lesson rows r20: ghost AF-100 numeral, H5 title, MetaChips, Disclosure; expanded = tint bg, description, tick bullets, themed chip, Show-Less; Module labels; Show-All CTA) | | 17968:8778 | P0 |
| `InstructorProfile` (eyebrow + H2 name (+muted suffix) · photo card w/ overlay link-buttons · 6 InfoCards) | | 17968:8758 | P0 |
| `LeadFormSection` (themed ellipse-gradient band: H2 + StatBlocks · white `FormCard` 630×588 r24: 4 fields, phone, consent, Apply, legal · logo strip) | | 17968:8912, 18735 | P0 |
| `FaqAccordion` (items r16: closed `#F3F3F3` h87 / open tint h158; H5 question, Disclosure) | | 17968:9022 | P0 |
| `SiteFooter` (scroll-up pill · **ExploreTopCourses mega-panel** (Component 3; accordion on mobile) · Company links · socials/phone/address · legal row; + NewsletterSignup ≥768) | | 17968:6558, 16701 | P0 |
| `OgImageTemplate` (600×315: tag, H3 title, credit block w/ blur, partner logo, wordmark) | for `@vercel/og` generation | 17968:18717 | P1 |
| `CookieConsent`, `ChatLauncher`, `VideoLightbox`, `Pagination` (numbered), `EmptyState` | [Site] parity, undrawn | — | P1 |

### 4.4 Templates (pages)

**Designed [Fig]:** Home · Course Catalog · Course Page — each at §3.3 breakpoints, course page themed per category.

**Site parity [Site], to design from system pieces:** Reviews wall (aggregate hero, multi-select course filter,
video/text toggle, source badges, empty state) · Blog hub + article (prose via typeset, callouts, inline
recommended-courses block) · About (stat counters, press bar, instructor grid, FAQ) · Success story (Q&A,
rating scale, related grid) + listing hub · Category hubs · Careers (map, process steps, ATS list) ·
Legal/long-form · Campaign (stand-with-ukraine) · 404/error.

**Anticipated [Ant]:** Checkout (`pay.elvtr.com`: order summary, installments/Klarna, gift card) ·
Consultation booking (slot picker) · Multi-step application wizard (progress, single-question steps, choice
chips) · Certificate verification page · Auth (login/reset) · **Student portal**: dashboard shell (sidebar nav,
topbar), schedule/calendar, lesson player (video + materials), syllabus progress, assignment submission +
feedback/grades, community/chat entry, notifications, profile/settings, billing. Portal reuses the same tokens
with a denser spacing mode and the P2 packages below.

---

## 5. Framework recommendation (verified July 2026)

**Component layer — shadcn/ui on Base UI, keep the copy-in model.**
shadcn CLI v4 (`registry:base`) now distributes a whole design system — components, CSS vars, fonts — as one
payload, supports monorepos natively, and as of July 2026 defaults to **Base UI** primitives (1.6, by the
original Radix team; Radix itself has stalled post-acquisition — our kit's `radix-ui` dep should be swapped
while it's only 6 components deep). Styled libraries (HeroUI, Mantine, MUI) were rejected: fighting their look
to reach this serif-editorial brand costs more than composing unstyled primitives; Ark/Park UI is on Panda,
off our Tailwind path. `shadcn/typeset` handles blog/legal prose.

**App framework — Next.js 16 (App Router) for the marketing site now and the portal later**, one monorepo.
PPR is stable (Cache Components), SEO/i18n/OG tooling is first-class, and same-document **View Transitions**
are supported in all engines (Chrome 111+/Safari 18+/Firefox 144+) — use `next-view-transitions` today, native
React `<ViewTransition>` when the experimental flag stabilizes. Astro 6 was runner-up (great content story,
but React-island tax on every shadcn component + a second framework for the portal); TanStack Start fits a
standalone portal but is weaker for SEO/marketing.

**React 19.2** (required by Next 16 and assumed by current shadcn/Base UI; pin ≥19.2.1). The kit's React 18
peer dep moves to `^19`.

**Motion:** `motion` v12 (MIT, `LazyMotion` ≈4.6kB) for component micro-interactions & count-ups; **GSAP 3.13
(fully free since the Webflow acquisition, incl. SplitText/ScrollTrigger)** for scroll set-pieces (pixel-decor
choreography, parallax, marquee pinning); CSS/View Transitions for page-level moves; **Embla** for carousels
(story cards, logo marquee fallback, testimonial rows) with `prefers-reduced-motion` wired manually. Skip Lenis
by default (scroll-snap/touch conflicts); native scroll + CSS scroll-driven animations first.

**Portal-layer packages (P2):** TanStack Table v8 (v9 in beta — hold), TanStack Query, react-hook-form + zod,
react-day-picker, **Schedule-X** (event calendar), Recharts 3 via shadcn charts, Tiptap 3, react-dropzone +
UploadThing (or S3 presign), Mux Player/Vidstack for video.

**Repo architecture:**

```
elvtr/ (pnpm + Turborepo)
├─ packages/ui          ← @elvtr/ui evolves from ui-kit: tokens.css, fonts, icons, components (source-exported)
├─ apps/marketing       ← Next.js 16 (new-website repo content)
└─ apps/portal          ← later, same system
```

Tokens stay **Tailwind v4 `@theme` CSS variables** (no Style Dictionary unless native apps appear): brand
primitives → semantic slots → `data-theme` category overrides. Docs/QA: **Storybook 10** in `packages/ui` +
visual regression (Chromatic, or free Playwright `toHaveScreenshot`), Vitest 4; map built components back to
Figma via **Code Connect** so `get_design_context` returns real code.

**Existing `ui-kit` disposition:** keep — architecture, `exports` map, CVA patterns, demo-page idea, vuesax
`BrandIcon`. Change: re-init on Base UI, React 19, add the §3 token file as the default theme (keep the
Photo-Booth palette as a separate legacy theme file since that consumer exists), restructure into the monorepo.

---

## 6. Build plan

**Phase 0 — Foundations (unblocks everything)**
Monorepo scaffold; `packages/ui` re-init (shadcn CLI v4, Base UI, React 19.2, Tailwind v4); `tokens.css` per §3
(primitives → semantic slots → 4 `data-theme` palettes); licensed AF + Neue Montreal `@font-face` (woff2,
`font-display: swap`; **buy the Arizona Flare license**); icon pipeline (vuesax bulk + extras as a typed sprite);
Storybook 10 + VRT; motion utilities (`MotionConfig`, reduced-motion, View Transitions helper).
*Exit: token demo page renders all four themes.*

**Phase 1 — Atoms (§4.1, P0 set)**
Buttons (all 6 variants × sizes × the undrawn disabled/focus/loading states), inputs/phone/checkbox/switch/
search, tags/chips, stars, avatar, divider, tooltip, logo, chevron, skeleton/spinner/toast.
*Exit: Storybook states matrix per atom; a11y pass (focus-visible everywhere).*

**Phase 2 — Molecules (§4.2)** Trustpilot badge, rating cards, person row, quotes, stats, detail cards,
info cards, breadcrumbs, avatar stack, filter/search bar, form groups, newsletter, social tiles.

**Phase 3 — Organisms (§4.3)** header/drawer/sticky CTA; course card family + grids; story/testimonial/
blog cards + carousels/masonry; bento; section header; heroes; course-info band; syllabus + FAQ accordions;
instructor profile; lead-form section; footer + mega-panel; pixel decor; cookie banner.
*Exit: every organism matches Figma at 375/768/1366/1440/1920 in VRT.*

**Phase 4 — Marketing app (`apps/marketing` in `new-website`)**
Next.js 16 scaffold; three designed templates assembled from organisms; category theming wired to course data;
View Transitions (card → course-hero shared element); GSAP hero/pixel choreography; SEO/OG (per §4.3 template);
i18n scaffold (next-intl); analytics/cookie stack; then §4.4 parity pages as content allows.

**Phase 5 — Portal kit (P2)** app shell (sidebar/topbar), data table, calendar, charts, video player,
uploads, rich text, notifications — same tokens, denser density mode.

**Ongoing:** design-debt list (§2.3) back to the design team; new Figma components land as registry additions;
Code Connect kept in sync.

---

## 7. Open questions for design

1. `#21180D` vs `#0E081E` — one ink?
2. Is `primary-base #335CFF` alive (portal accent?) or legacy?
3. Category→theme mapping: which of the 11 site categories map to the 4 accent themes (or do more themes come)?
4. Hover/disabled/focus/loading states, form success state, cookie banner, dark-section usage — need design or
   may we standardize from the values in §2–§3?
5. Per-course art-directed card title faces: curated font list or pre-rendered assets?
6. Confirm Arizona Flare license purchase (variable, weights 442/571).
