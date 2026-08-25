# Meetball

The user-facing skin for the `creative-gamma-intro-meetings` skill: someone on
the team signs in with their ELVTR Google account, types a cohort code, and gets
back a link to the cohort's Introduction Meeting deck in Gamma.

**Meetball** is the product name (Figma, Desktop-9). The folder, the package
(`@elvtr/intro-meeting`) and the `INTRO_MEETING_*` env vars still carry the old
name — renaming those changes deploy configuration, so it is a separate step.

Four screens, assembled from `@elvtr/ui-kit`:

| Screen | Figma | What it does |
| --- | --- | --- |
| Sign in | `5725:11407` (Desktop-9) | "Welcome to Meetball" — Google sign-in, verified `@elvtr.com` only |
| Cohort prompt | `5709:5198` (Desktop-1) | "Good {part of day}, {name}!" + the cohort field, which suggests as you type |
| Colour pair | `5715:6596` (Desktop-6) | Only when Planna Cotta has no `color_scheme`. Two dropdowns with colour dots |
| Ta-da | `5721:2` (Desktop-8) | The deck link, plus a disclaimer card per thing the run could not resolve |

Every screen carries the account chip from `5722:11404` in the top right —
initials, and the way out.

Design source: Core Brand Guides 2.0 (`RYsViepdOiw1cMDVPLgJ3Y`), page
**Intro Meeting UI**. Two more states the mockups don't cover — work in progress
and failure — reuse the same shell.

## Run it

From the repo root (the UI kit is the workspace root):

```bash
npm install
npm run dev:intro                       # or: npm run dev --workspace @elvtr/intro-meeting
```

Sign-in needs Google credentials. To click through the flow without them:

```bash
cd apps/intro-meeting
INTRO_MEETING_LOCAL_PREVIEW=1 npm run dev     # skips auth, localhost only
```

## Sign-in

Identical in policy to [Photo Booth](https://github.com/yegorwalowski-elvtr/photo-booth)
(`src/auth.ts` there and here): next-auth v5, Google provider, and access
restricted to **verified `@elvtr.com` Google Workspace accounts**.

- `hd=elvtr.com` on the authorization request pre-filters the account chooser.
  It is a hint, not a guarantee — so the `signIn` callback re-checks the ID
  token's `hd`, `email_verified` and email domain, and that is the real gate.
- `src/proxy.ts` protects every route except the auth endpoints, `/login`,
  `/api/health` and static assets. The run API is behind it, so no anonymous
  caller can start a deck.
- Set `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — see
  `.env.example` — and add `<AUTH_URL>/api/auth/callback/google` to the OAuth
  client's authorized redirect URIs.

Two escape hatches, both off by default:

| Variable | Effect |
| --- | --- |
| `INTRO_MEETING_LOCAL_PREVIEW=1` | Skips auth **on localhost only**; other hosts get a 403 |
| `INTRO_MEETING_PUBLIC_PREVIEW=1` | Skips auth on every host — staging review before OAuth exists. Remove it as soon as `AUTH_GOOGLE_*` are set |

In either preview mode a run is attributed to `preview@elvtr.com`.

## Cohort suggestions

The field is a combobox: what you type goes to `GET /api/cohorts?q=` (debounced
180ms, previous request aborted) and the matches drop down with their course
title underneath. A real runner asks Planna Cotta `list_cohorts(q=…)`.

Free text still submits — a cohort that Planna has not published yet can be
typed in full rather than blocked by the suggestion list.

## The colour question

The skill reads the pair from the cohort's Planna Cotta `color_scheme`
(`purple_turquoise` → Purple + Turquoise). The UI asks **only** when that field
is empty — typical for cohorts still in `planned`. Asking every time would
override Planna, which is why there is no colour picker on the first screen.

The two dropdowns are built from `GET /api/color-schemes` (the runner's view of
which pairs exist), not from a list hardcoded in the UI, and each side filters
the other — so an impossible pair can never be assembled. Purple + Pink has no
template, and White pairs only with Light Blue. The API re-checks the pair too,
so a hand-rolled request can't slip one through.

### Where the swatch colours come from

The design team, directly — and they had to, because nothing in the pipeline
holds them. A cohort's Planna Cotta `color_scheme` is a bare slug; Planna's only
hex is `market.color`, the market brand colour, which the skill says is *not*
the deck colour; and Figma's Brand Colors collection is five
Latent/Signal/Diffuse palettes under other names. This is the Intro Meeting
template palette specifically:

| Base | | Accent | |
| --- | --- | --- | --- |
| Blue | `#102E9C` | Lime | `#E5F744` |
| Green | `#025453` | Turquoise | `#9BEEE7` |
| Purple | `#58438A` | Pink | `#EDAEF9` |
| White | `#F9F9F9` | Light Blue | `#63ADF2` |

They live in `SWATCHES` in [`src/lib/colors.ts`](src/lib/colors.ts) — the only
place to correct them. The dots are cosmetic: the slug sent to the skill is what
picks the Gamma template. White and Light Blue are the pale pair, so every dot
keeps a hairline ring to stay visible on the Cream field.

## Disclaimers

The skill surfaces what it could not resolve rather than guessing — no Discord
link in Planna, no Google Classroom link, a program manager who is not in the
PM directory, a course end date it could not confirm. Those come back as
`result.flags` and each renders as a `DisclaimerCard` on the Ta-da screen, so
nothing silently ships wrong.

## Runner: mock today, real later

Nothing here runs the skill yet. `src/lib/runner/` is the seam:

- `types.ts` — the contract (`IntroMeetingRunner`: `start`, `poll`,
  `submitColors`) and the run states.
- `mock.ts` — the default. Times out a plausible sequence of steps and
  fabricates **no** cohort data: suggestions, course titles and the colour
  branch all come from `planna-snapshot.ts`, a dated snapshot of real Planna
  rows, and instructor/PM come back `null`. Every finished run carries a flag
  saying no deck was generated, and "Open Presentation" lands on `/mock-deck`,
  which says the same thing.
- `index.ts` — the one line to change when a real runner exists.

Which branch the mock takes is decided by the code you type:

| You type | You get |
| --- | --- |
| a snapshot cohort **with** a `color_scheme` (`GD10`, `AIM9`, `UK-CD7`…) | Pair resolved from "Planna" — straight to the build |
| a snapshot cohort **without** one (`UK-COO3`, `MDPM1`) | The "Oops, No Colors Yet!" question — both genuinely have none in Planna |
| anything not in the snapshot (`ZZZ9`) | The failure screen, worded as Planna would |
| `not a code!` | Client-side validation on the field |

A real runner has to run the skill with the cohort code, relay the colour
question when Planna has no `color_scheme`, and return the Gamma URL plus the
skill's flags (missing Google Classroom link, PM absent from the directory,
unconfirmed course end date — the skill surfaces these instead of guessing, so
the UI shows them on the Ta-da screen). Keep it server-side: it holds the
Planna / Figma / Gamma credentials.

Note the pair → Gamma template-id map is deliberately **not** in this app. The
skill re-queries Gamma for the current ids on every run, because template titles
get renamed in place.

## API

All three require a session (or a preview switch).

| Route | Body | Returns |
| --- | --- | --- |
| `GET /api/cohorts?q=` | — | `{ suggestions: [{ cohortCode, courseTitle }] }` |
| `GET /api/color-schemes` | — | `{ schemes: ["purple_turquoise", …] }` |
| `POST /api/runs` | `{ cohortCode }` | `{ runId, state }` |
| `GET /api/runs/{id}` | — | `{ runId, state }` |
| `POST /api/runs/{id}` | `{ scheme }` | `{ runId, state }` |

`state` is one of `running` / `needs-colors` / `done` / `failed` — see
`src/lib/runner/types.ts`. The client polls `GET` every 1.2s while a run is
`running` and stops as soon as it isn't, so an idle tab makes no requests.

## Hero art

The heroes in `public/hero/` are the Figma renders, background keyed out so they
sit on the Mauve ground with no seam: `login.png` (the Meetball cat) on the
welcome screen, `greeting.png` on the prompt, `colors.png` on the colour
question, `done.png` on Ta-da, and `door.png` — the old welcome art — on the
failure and mock-deck screens. To move to **transparent video**,
pass `video={{ webm, hevc }}` to `HeroStage` alongside the still — see the UI
kit README. Two encodes are needed (VP9/AV1-alpha WebM for Chrome/Firefox,
HEVC-alpha MP4/MOV for Safari); a ProRes `.mov` on its own plays in neither, and
the still stays the poster and the reduced-motion fallback.

## Fonts

ABC Arizona Flare and Neue Montreal are licensed, so no binaries are committed.
Drop them into `public/fonts/` — that folder's README lists the filenames.
Without them the fallbacks (Georgia / Inter) keep everything legible but the
type will not match Figma.

## Deploy

`railway.json` mirrors Photo Booth's: RAILPACK build, `npm run start`,
healthcheck `/api/health`. Build and start commands run through the workspace so
the UI kit is linked. Set `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`,
`AUTH_GOOGLE_SECRET`.

> The mock runner keeps run state in memory, which is fine for one instance and
> wrong for several. A real runner needs its own store.
