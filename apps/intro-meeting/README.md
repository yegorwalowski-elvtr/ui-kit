# Intro Meeting

The user-facing skin for the `creative-gamma-intro-meetings` skill: someone on
the team signs in with their ELVTR Google account, types a cohort code, and gets
back a link to the cohort's Introduction Meeting deck in Gamma.

Four screens, assembled from `@elvtr/ui-kit`:

| Screen | Figma | What it does |
| --- | --- | --- |
| Sign in | — (built from the same parts) | Google sign-in, verified `@elvtr.com` only |
| Cohort prompt | `5709:5198` | "Good {part of day}, {name}!" + the cohort code field |
| Colour pair | `5715:6596` | Only when Planna Cotta has no `color_scheme` for the cohort |
| Ta-da | `5715:6619` | The deck link, plus anything the run flagged |

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

## The colour question

The skill reads the pair from the cohort's Planna Cotta `color_scheme`
(`purple_turquoise` → Purple + Turquoise). The UI asks **only** when that field
is empty — typical for cohorts still in `planned`. Asking every time would
override Planna, which is why there is no colour picker on the first screen.

Only nine pairs have a template, so the two dropdowns constrain each other:
Purple + Pink has none, and White pairs only with Light Blue (and Light Blue
only with White). `src/lib/colors.ts` holds that list; the API rejects an
invalid pair as well, so a hand-rolled request can't slip one through.

## Runner: mock today, real later

Nothing here runs the skill yet. `src/lib/runner/` is the seam:

- `types.ts` — the contract (`IntroMeetingRunner`: `start`, `poll`,
  `submitColors`) and the run states.
- `mock.ts` — the default. Times out a plausible sequence of steps and
  fabricates **no** cohort data: the course title is derived from what you
  typed, instructor and PM come back `null`, and every finished run carries a
  flag saying no deck was generated. "Open Presentation" lands on `/mock-deck`,
  which says the same thing.
- `index.ts` — the one line to change when a real runner exists.

Which branch the mock takes is decided by the code you type:

| You type | You get |
| --- | --- |
| `MDPM1`, `FSD3`, `GD9` | Pair "resolved from Planna" — straight to the build |
| anything else | The "Oops, No Colors Yet!" question |
| `FAIL…` (e.g. `FAILX`) | The failure screen |
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
| `POST /api/runs` | `{ cohortCode }` | `{ runId, state }` |
| `GET /api/runs/{id}` | — | `{ runId, state }` |
| `POST /api/runs/{id}` | `{ scheme }` | `{ runId, state }` |

`state` is one of `running` / `needs-colors` / `done` / `failed` — see
`src/lib/runner/types.ts`. The client polls `GET` every 1.2s while a run is
`running` and stops as soon as it isn't, so an idle tab makes no requests.

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
