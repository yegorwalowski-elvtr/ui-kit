# @elvtr/ui-kit

ELVTR design-system foundation: **React 18/19 + TypeScript + Tailwind CSS v4 +
shadcn/ui**, carrying the ELVTR brand tokens, licensed fonts and vuesax-bulk
brand icons. Product UIs (the **Photo Booth** service screens; the **Intro
Meeting** app in [`apps/intro-meeting`](apps/intro-meeting)) are assembled from
this kit.

```bash
npm install       # once — installs the kit and every app under apps/*
npm run dev       # kit demo/spec page at http://localhost:5173
npm run build     # icons + typecheck + production build of the demo
npm run dev:intro # the Intro Meeting app (apps/intro-meeting)
```

The demo page (`src/demo/App.tsx`) shows every token and component next to its
spec so designers can eyeball fidelity against Figma.

## Source of truth: Figma

Tokens and component styling in this kit were extracted from these ELVTR Figma
files — when in doubt, Figma wins:

| File | Key |
| --- | --- |
| Photo-Booth guide | `4lATmsCWTIPFijqrJ3coMN` |
| E-mail Student Care | `GoIYuTuzY350FDmR5UYGrc` |
| Core Brand Guides 2.0 (page "Intro Meeting UI", 3D icons) | `RYsViepdOiw1cMDVPLgJ3Y` |

## Brand tokens

Defined in [`src/styles/tokens.css`](src/styles/tokens.css) as CSS variables,
exposed both as raw brand utilities (`bg-elvtr-lime`, `text-elvtr-dark-teal`, …)
and mapped onto the shadcn/ui semantic slots (light theme only for now).

### Colors

| Figma style / name | Hex | CSS variable | Used for | shadcn slot |
| --- | --- | --- | --- | --- |
| Green-Lime Palette/Dark Teal | `#004A4A` | `--elvtr-dark-teal` | Primary brand, page-hero bg, headings on light | `primary` (fg `#F3F3F3`), `ring` |
| Lime accent | `#C8FF68` | `--elvtr-lime` | Chips, highlight text on teal | `accent` (fg Dark Teal) |
| Alice Blue | `#EBF2F4` | `--elvtr-alice-blue` | Info-tile / card background | `card`, `muted`, `secondary` |
| B&W/Dark | `#212121` | `--elvtr-dark` | Body text | `foreground` |
| Light | `#F3F3F3` | `--elvtr-light` | Light text on teal, light neutral | `primary-foreground` |
| Sand | `#F2EFE9` | `--elvtr-sand` | Page background behind cards | `background` |

#### Cola Orange surface

A second surface, from Core Brand Guides 2.0 ("Intro Meeting UI"). It does not
touch the shadcn semantic slots — use the brand utilities directly.

| Figma style / name | Hex | CSS variable | Used for |
| --- | --- | --- | --- |
| Brand/Cola Orange/Signal | `#FF8A00` | `--elvtr-cola-signal` | CTA ink |
| Brand/Cola Orange/Latent | `#2E1A0C` | `--elvtr-cola-latent` | CTA ground |
| Mauve (raw hex) | `#C2B2B3` | `--elvtr-mauve` | Page ground of those screens |
| Cream (raw hex) | `#F9EFEC` | `--elvtr-cream` | Field ground on mauve |

Mauve and Cream are **raw hex** in Figma, not published variables — `TODO
tokenize with Design Team` (marked in `tokens.css`).

Rules baked into the components:

- **Lime pairs ONLY with Dark Teal** — never set white/light text on lime.
- **Cola Orange Signal only ever sits on Cola Orange Latent** — never Signal on
  the mauve page ground (fails contrast), never light text on Signal.
- **Sand** was eyeballed from the email render — `TODO confirm exact hex with
  Design Team` (marked in `tokens.css`).
- `border`/`input`/`muted-foreground` are derived tints of `#212121`;
  `destructive` keeps a shadcn default red (no red exists in the palette).

### Radii

| Token | Value | Used for |
| --- | --- | --- |
| `--radius` | `0.9375rem` (15px) | Cards / tiles (`rounded-lg`) |
| pills | `rounded-full` | Chips, CTA bars, tab pills (~30px heights) |

### Typography

| Role | Typeface | Weight | Spec (from Figma) | Fallbacks |
| --- | --- | --- | --- | --- |
| Display / headings (`font-display`) | ABC Arizona Flare (Dinamo) | 500 | H1 34px/1.0, ls −1px; hero up to 200px/0.9; tile headers 22px; `display` 56px/1.0, ls −2.24px | Georgia, 'Times New Roman', serif |
| UI / body (`font-sans`) | Neue Montreal (Pangram Pangram) | 500 | P2 16px/1.2; `lead` 24px/1.2 | Inter, 'Helvetica Neue', Arial, sans-serif |

`Heading level="display"` (56px / 1.0, ls −2.24px) and `Text variant="lead"`
(30px / 1.2) are the Intro Meeting screen title and its supporting line. Both
clamp down on narrow viewports — the Figma values are the desktop ceiling.

## Fonts (licensed — action required)

Both typefaces are commercially licensed, so **no font binaries ship with this
repo and none are fetched from the internet**. `src/styles/fonts.css` declares
`@font-face` rules pointing at `/fonts/*.woff2`; drop the licensed files into
[`public/fonts/`](public/fonts/README.md) — that README lists the exact
filenames (Medium required; Regular/Bold slots are pre-written but commented
out). Without the files, the fallback stacks keep everything legible.

## Components

shadcn/ui base (generated via the shadcn CLI, new-york style) in
`src/components/ui/`:

`Button` · `Badge` · `Card` (+ subcomponents) · `Tabs` · `Input` · `Label`

ELVTR brand components in `src/components/elvtr/`:

| Component | What it is |
| --- | --- |
| `Chip` | Lime pill with Dark Teal text (the "HR Materials" cover chip) |
| `CtaButton` | Full-width Dark Teal pill bar with light text ("Join Google Classroom") |
| `DetailTile` | Alice Blue rounded-15 tile: icon + Arizona Flare 22px header + Neue Montreal 16px body (the email "Session Details" tiles) |
| `SectionTabs` / `SectionTabsContent` | Pill tab-row like the Photo Guide deck navigation |
| `Heading` / `Text` | Type primitives applying the brand scale (`hero`/`h1`–`h4`, `p1`/`p2`/`caption`) |
| `BrandIcon` | Renders the bundled vuesax **bulk** brand SVGs by name: `text`, `people`, `calendar`, `clock`, `warning` (recolorable via `color` prop) |
| `HeroStage` (+ `HeroStageCopy`, `HeroStageActions`) | Full-viewport Cola Orange page shell: mauve ground, a levitating hero object, centred copy and action block, and an optional `topBar` slot pinned top-right. Takes a still `image` or transparent `video` (see below) |
| `AccountChip` | 50px Cream square with the signed-in person's initials (`initialsFrom` builds them) |
| `ColaButton` | Cola Orange CTA — Signal ink on Latent ground, 12px radius, Arizona Flare 24px |
| `DisclaimerCard` | Cream notice, 20px radius, `warning` brand icon + one line — for what a run could not resolve and must not guess |
| `PillInput` | Cream field on mauve — 12px radius, 24px type, placeholder at 50% B&W/Dark |
| `PillCombobox` | The same field with a suggestion list underneath; the caller supplies the matches. Free text is still allowed |
| `PillSelect` | The same field as a native `<select>` with the Figma chevron pinned right |
| `SwatchSelect` | A listbox version of that field whose rows carry a colour dot — a native `<option>` cannot render one |

The Cream field geometry those four share lives in
[`src/components/elvtr/field.ts`](src/components/elvtr/field.ts); change it
there, not per component.

### Transparent video heroes

`HeroStage` accepts `video={{ webm, hevc }}` alongside `image`. No single codec
plays everywhere, so supply both:

| Source | Format | Plays in |
| --- | --- | --- |
| `webm` | VP9 or AV1 **with alpha**, `.webm` | Chrome, Edge, Firefox |
| `hevc` | HEVC **with alpha**, `.mp4`/`.mov` (`hvc1`) | Safari (macOS + iOS) |

`image` stays required — it is the poster, and the fallback when neither source
plays or the viewer has asked for reduced motion. A ProRes 4444 `.mov` straight
out of After Effects does **not** play in any browser; export the two web
formats from it.

Generic product icons: use [`lucide-react`](https://lucide.dev) (shadcn
default), already a dependency.

Brand SVGs are inlined into `src/assets/icons/svg-sources.ts` by
`npm run build:icons` (which `npm run build` runs first). The `.svg` files stay
the source of truth designers export to — edit those, then regenerate. This
replaced Vite's `?raw` imports so the kit builds under any bundler.

Adding more shadcn components: `npx shadcn@latest add <component>` (a
`components.json` is checked in). Note the CLI writes `@/lib/utils` imports —
convert them to relative (`../../lib/utils`) so the package stays consumable
as source.

## Consuming from another app

The kit ships as **source** (`src/index.ts` — see `exports` in
`package.json`); the consumer's bundler compiles it. Recommended for Vite
apps like Photo Booth:

1. **Add the dependency**
   - Workspace (preferred while iterating): put both apps in one npm
     workspace, or `"@elvtr/ui-kit": "file:../ui-kit"`.
   - Git dependency: `"@elvtr/ui-kit": "git+ssh://git@github.com/elvtr/ui-kit.git#main"`.
2. **Install React 18 or 19** — `react`/`react-dom` are peer dependencies
   (`^18.3.1 || ^19.0.0`).
3. **Set up Tailwind v4** in the consumer (`@tailwindcss/vite` plugin) and in
   its main CSS file:

   ```css
   @import "@elvtr/ui-kit/styles.css";
   /* Let Tailwind see the kit's class names so utilities get generated */
   @source "../node_modules/@elvtr/ui-kit/src";
   ```

   (`styles.css` already contains `@import "tailwindcss"` and the ELVTR theme —
   don't import Tailwind twice. Adjust the `@source` path to wherever the
   package resolves from your CSS file.)
4. **Copy the licensed fonts** into the consumer's `public/fonts/` (same
   filenames — see `public/fonts/README.md`).
5. Import components:

   ```tsx
   import { Button, Chip, CtaButton, DetailTile, BrandIcon } from "@elvtr/ui-kit"
   ```

No bundler-specific imports are used, so any bundler works. For Next.js, add
`transpilePackages: ["@elvtr/ui-kit"]` — the kit ships TypeScript source. The
components that hold state (`HeroStage`, `PillCombobox`, `SwatchSelect`) declare
`"use client"`, so React Server Components can import them directly;
`apps/intro-meeting/next.config.ts` is a working example.

## Project layout

```
src/
  index.ts               # public exports
  styles/tokens.css      # Tailwind v4 theme + shadcn slots + brand palette
  styles/fonts.css       # @font-face for licensed fonts (files not included)
  lib/utils.ts           # cn()
  components/ui/         # shadcn/ui base components
  components/elvtr/      # brand components
  assets/icons/vuesax-bulk/  # brand SVG icons (text, people, calendar, clock)
  assets/icons/ui/       # UI SVGs (select chevron)
  assets/icons/svg-sources.ts  # GENERATED — npm run build:icons
  demo/                  # runnable spec page (npm run dev)
scripts/                 # build:icons generator
public/fonts/            # drop licensed .woff2 files here
apps/
  intro-meeting/         # Next.js app — the Intro Meeting skin (own README)
```

## Apps

Apps live in `apps/*` as npm workspaces and consume the kit from source.

| App | What it is |
| --- | --- |
| [`apps/intro-meeting`](apps/intro-meeting) | Skin for the `creative-gamma-intro-meetings` skill — ELVTR Google sign-in, cohort code in, Gamma deck link out |
