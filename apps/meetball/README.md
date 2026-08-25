# Meetball

The user-facing skin for the `creative-gamma-intro-meetings` skill: someone on
the team signs in with their ELVTR Google account, types a cohort code, and gets
back a link to the cohort's Introduction Meeting deck in Gamma.

**Meetball** is the product name (Figma, Desktop-9); the folder, the package and
the `MEETBALL_*` env vars all match it.

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
npm run dev:meetball                       # or: npm run dev --workspace @elvtr/meetball
```

Sign-in needs Google credentials. To click through the flow without them:

```bash
cd apps/meetball
MEETBALL_LOCAL_PREVIEW=1 npm run dev     # skips auth, localhost only
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
| `MEETBALL_LOCAL_PREVIEW=1` | Skips auth in a **development build only** (`npm run dev`). Inert under `npm run start`, so setting it on a deployed host does nothing |
| `MEETBALL_PUBLIC_PREVIEW=1` | Skips auth **on every host, deployed ones included** — staging review before OAuth exists. Remove it the moment `AUTH_GOOGLE_*` are set |

`MEETBALL_LOCAL_PREVIEW` is gated on the build rather than on the request's
hostname, and that matters: a hostname comes from the caller's own `Host` header,
so it cannot carry a trust decision. `NODE_ENV` can't be set by a request.

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

## Runner: how a deck actually gets built

`src/lib/runner/` is the seam. `types.ts` is the contract — `suggestCohorts`,
`listColorSchemes`, `start`, `poll`, `submitColors` — and `index.ts` picks the
implementation: the **agent runner** when `MEETBALL_AGENT_ID` and
`MEETBALL_ENVIRONMENT_ID` are both set, otherwise the **mock**. A deploy without
them is a working demo, not a broken tool.

### The agent runner (`agent.ts`)

The skill is not code Meetball can call — it is a Claude workflow that reads
Planna Cotta, pulls the instructor photo out of Figma, composites it with
Pillow, hosts it back in Figma and generates the deck in Gamma. So each run is
one **Managed Agents** session executing that skill: Anthropic runs the agent
loop and hosts the sandbox (which already has Python and Pillow), the three MCP
servers are declared on the agent, and their credentials live in a vault — never
in this app's environment, and never in the sandbox where the run could leak
them.

`start` creates the session, opens the event stream, and leaves a loop writing
each transition into an in-memory run record. The UI polls that record, so the
stream and the request cycle stay decoupled and a browser refresh mid-run loses
nothing.

**The colour question is why the colour screen exists.** There is no human
inside a headless session, so the agent has a custom tool `request_color_pair`
instead of the skill's pop-up. Calling it parks the session; the loop flips the
run to `needs-colors`; `submitColors` answers that exact tool call and the agent
resumes — same session, no second Planna lookup. The finished deck comes back
through a second custom tool, `report_result`, rather than being regexed out of
prose. Both live in `agent-protocol.ts`, which the provisioning script and the
runtime share so they cannot drift.

One thing is deliberately **not** live: cohort suggestions and the scheme list
are served from `planna-snapshot.ts` and the template list, because a model call
per keystroke would be absurd. A direct Planna client is the follow-up.

### Provisioning it (once)

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run setup:agent --workspace @elvtr/meetball
```

Creates the skill (uploaded from your synced copy — set `MEETBALL_SKILL_DIR` if
it is not at `~/.claude/skills/synced/creative-gamma-intro-meetings`), the
environment, the agent and an empty vault, then prints the env block. Re-running
with `MEETBALL_AGENT_ID` set **updates** that agent into a new version instead of
creating a second one.

Then add one credential per MCP server to the vault, keyed by its URL —
`design-mcp` (Planna), `mcp.figma.com`, `mcp.gamma.app`. An empty vault means
the run reaches all three unauthenticated and fails there. Figma and Gamma are
hosted MCP servers and want an OAuth bearer, not the service's own API key.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Creates sessions. Server-side only |
| `MEETBALL_AGENT_ID` | The provisioned agent |
| `MEETBALL_ENVIRONMENT_ID` | Its sandbox environment |
| `MEETBALL_VAULT_IDS` | Comma-separated vaults holding the MCP credentials |

### What is proven and what is not

`npm run test:runner` drives the runner through every path with a scripted fake
transport — no key, no session, no cost: Planna-has-the-pair straight through,
park-and-resume on the colour question, a repeat answer ignored rather than
stalling the session, an invalid pair refused, a session that ends without a
result failing loudly, a result with no link rejected, `session.error`
surfacing, tool calls becoming progress lines, and typeahead never starting a
session. CI runs it.

**Not proven:** that the live API accepts these exact payloads, that the skill
runs correctly in the sandbox, and that MCP auth works. Only a real session
shows that, and it needs credentials this branch does not have. Expect to
iterate on the first live run — the Console session viewer (Managed Agents ->
Sessions) is where to watch it.

### The mock (`mock.ts`)

The default. Times out a plausible sequence of steps and fabricates **no**
cohort data: suggestions, titles and the colour branch all come from
`planna-snapshot.ts`, a dated snapshot of real Planna rows, and instructor/PM
come back `null`. Every finished run carries a flag saying no deck was
generated, and "Open Presentation" lands on `/mock-deck`, which says the same.

Which branch the mock takes is decided by the code you type:

| You type | You get |
| --- | --- |
| a snapshot cohort **with** a `color_scheme` (`GD10`, `AIM9`, `UK-CD7`…) | Pair resolved from "Planna" — straight to the build |
| a snapshot cohort **without** one (`UK-COO3`, `MDPM1`) | The "Oops, No Colors Yet!" question — both genuinely have none in Planna |
| anything not in the snapshot (`ZZZ9`) | The failure screen, worded as Planna would |
| `not a code!` | Client-side validation on the field |

Note the pair -> Gamma template-id map is deliberately **not** in this app. The
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

`public/hero/` is the only place these live, and the filename is the wiring —
`src/lib/hero-media.ts` reads the folder on each request, so **dropping a file
in is the whole change**: no code edit, no rebuild.

| File | Screen |
| --- | --- |
| `login.*` | Welcome / sign-in (the Meetball cat) |
| `greeting.*` | Cohort prompt, and the in-progress state |
| `colors.*` | "Oops, No Colors Yet!" |
| `done.*` | Ta-da |
| `door.*` | Failure, and `/mock-deck` |

The stills are the Figma renders with the background keyed out so they sit on
the Mauve ground with no seam.

### Replacing a still with motion

Drop a file next to the `.png` — it stays as the first paint and the fallback.
Three formats are recognised, in this priority order:

| Extension | What it is | Animates in |
| --- | --- | --- |
| `<name>.webp` | Animated WebP with alpha, rendered as `<img>` | **Every current browser, Safari included** |
| `<name>.webm` | VP9/AV1 with alpha, rendered as `<video>` | Chrome, Edge, Firefox |
| `<name>.mp4` / `.mov` | HEVC with alpha, rendered as `<video>` | Safari only |

**Animated WebP is the recommended one**, and the priority order exists because
of a trap: Safari happily *plays* a VP9 WebM and paints the transparent area
**black**. Given both a `.webp` and a `.webm`, the `.webp` wins so that can
never happen.

HEVC-with-alpha is the only transparent video Safari renders correctly, and only
Apple tooling writes it (After Effects/Motion/Compressor on macOS) — `libx265`
cannot encode an alpha layer. So on Windows, animated WebP is the way to get
motion everywhere.

#### From an After Effects export

Export from AE with alpha — **PNG Sequence** (lossless, simplest) or
**QuickTime → Animation / ProRes 4444**, with Channels set to *RGB + Alpha*.
Then:

```bash
# from a PNG sequence
ffmpeg -framerate 24 -i frame_%04d.png \
  -c:v libwebp_anim -pix_fmt yuva420p -lossless 0 -q:v 75 -loop 0 name.webp

# from a QuickTime master that carries alpha
ffmpeg -i master.mov \
  -c:v libwebp_anim -pix_fmt yuva420p -lossless 0 -q:v 75 -loop 0 name.webp

# optional, for hardware-decoded playback in Chrome/Firefox
ffmpeg -i master.mov -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -b:v 2M name.webm
```

Keep the loop short (2–3s) and the frame around 1466x800 — twice the 733x400 box
the frame places the hero in. `-q:v` trades size for quality; 70–80 is a good
band for these ceramic renders.

A viewer with "reduce motion" set always gets the `.png`, whichever files exist.

## Fonts

ABC Arizona Flare and Neue Montreal are licensed, so no binaries are committed.
Drop them into `public/fonts/` — that folder's README lists the filenames.
Without them the fallbacks (Georgia / Inter) keep everything legible but the
type will not match Figma.

## Deploy

`railway.json` lives at the **repo root**, not here, and that placement is
load-bearing: this app is an npm workspace whose UI-kit dependency resolves to
`../..`, so install, build and start all have to run from the root. Point the
Railway service at the repository root (the default) and leave it alone.

It mirrors Photo Booth's otherwise: RAILPACK, `npm run build:meetball` /
`npm run start:meetball`, healthcheck `/api/health`. Set `AUTH_SECRET`, `AUTH_URL`,
`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and add
`<AUTH_URL>/api/auth/callback/google` to the Google OAuth client's authorized
redirect URIs.

> The mock runner keeps run state in memory, which is fine for one instance and
> wrong for several. A real runner needs its own store.
