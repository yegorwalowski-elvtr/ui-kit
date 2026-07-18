# @elvtr/ui-kit

ELVTR design-system foundation: **React 18 + TypeScript + Tailwind CSS v4 +
shadcn/ui**, carrying the ELVTR brand tokens, licensed fonts and vuesax-bulk
brand icons. Product UIs (first consumer: the **Photo Booth** service screens)
are assembled from this kit.

```bash
npm install    # once
npm run dev    # demo/spec page at http://localhost:5173
npm run build  # typecheck + production build of the demo
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
| Good (deck sample) | `#A6D79D` | `--elvtr-good` | "PERFECT photo" badge green | — |
| Bad (deck sample) | `#EA5233` | `--elvtr-bad` | "BAD photo" badge red-orange | `destructive` |
| Warn | `#E3C87E` | `--elvtr-warn` | Warn accent (no deck token — deliberate on-palette warm tone) | — |
| Warn soft | `#FAF1DC` | `--elvtr-warn-soft` | Warn surface tint | — |
| Pill (deck sample) | `#E7DFE0` | `--elvtr-pill` | Neutral tab-nav pill fill | — |

Rules baked into the components:

- **Lime pairs ONLY with Dark Teal** — never set white/light text on lime.
- **Sand** was eyeballed from the email render — `TODO confirm exact hex with
  Design Team` (marked in `tokens.css`).
- `border`/`input`/`muted-foreground` are derived tints of `#212121`;
  `destructive` maps to the brand red-orange `--elvtr-bad` (the Photo-Booth
  "BAD photo" badge color).

### Radii

| Token | Value | Used for |
| --- | --- | --- |
| `--radius` | `0.9375rem` (15px) | Cards / tiles (`rounded-lg`) |
| pills | `rounded-full` | Chips, CTA bars, tab pills (~30px heights) |

### Typography

| Role | Typeface | Weight | Spec (from Figma) | Fallbacks |
| --- | --- | --- | --- | --- |
| Display / headings (`font-display`) | ABC Arizona Flare (Dinamo) | 500 | H1 34px/1.0, ls −1px; hero up to 200px/0.9; tile headers 22px | Georgia, 'Times New Roman', serif |
| UI / body (`font-sans`) | Neue Montreal (Pangram Pangram) | 500 | P2 16px/1.2 | Inter, 'Helvetica Neue', Arial, sans-serif |

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
| `Chip` | Brand pill (the "HR Materials" cover chip) — `variant`: `accent` (lime, default) / `primary` (teal with lime text) / `pill` (neutral nav) / `good` / `bad` / `warn` |
| `CtaButton` | Full-width Dark Teal pill bar with light text ("Join Google Classroom") |
| `DetailTile` | Alice Blue rounded-15 tile: icon + Arizona Flare 22px header + Neue Montreal 16px body (the email "Session Details" tiles) |
| `SectionTabs` / `SectionTabsContent` | Pill tab-row like the Photo Guide deck navigation |
| `StatusGlyph` | Small circular `pass`/`fail`/`warn`/`pending` glyph for check/verdict UIs (aria-hidden by default) |
| `Heading` / `Text` | Type primitives applying the brand scale (`hero`/`h1`–`h4`, `p1`/`p2`/`caption`) |
| `BrandIcon` | Renders the bundled vuesax **bulk** brand SVGs by name: `text`, `people`, `calendar`, `clock` (recolorable via `color` prop) |

Generic product icons: use [`lucide-react`](https://lucide.dev) (shadcn
default), already a dependency.

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
2. **Install React 18** — `react`/`react-dom` are peer dependencies.
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

Note: `BrandIcon` uses Vite `?raw` SVG imports, so the consumer should build
with Vite (or a bundler configured to inline `?raw` assets).

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
  demo/                  # runnable spec page (npm run dev)
public/fonts/            # drop licensed .woff2 files here
```
