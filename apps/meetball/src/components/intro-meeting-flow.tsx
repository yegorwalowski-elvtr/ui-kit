"use client"

import * as React from "react"
import {
  ColaButton,
  DisclaimerCard,
  HeroStage,
  HeroStageActions,
  HeroStageCopy,
  Heading,
  PillCombobox,
  SwatchSelect,
  Text,
  type ComboboxSuggestion,
} from "@elvtr/ui-kit"

import { AccountMenu } from "@/components/account-menu"
import { parseCohortCode } from "@/lib/cohort-code"
import {
  accentsIn,
  basesIn,
  colorLabel,
  colorSwatch,
  isColorScheme,
  toScheme,
  type ColorAccent,
  type ColorBase,
  type ColorScheme,
} from "@/lib/colors"
import { partOfDay } from "@/lib/greeting"
import type { HeroMediaMap } from "@/lib/hero-media"
import type { CohortSuggestion, RunState } from "@/lib/runner/types"

/*
 * The screens of Core Brand Guides 2.0, "Intro Meeting UI": Desktop-1
 * (5709:5198) prompt, Desktop-6 (5715:6596) colour pair, Desktop-8 (5721:2)
 * Ta-da with disclaimers — plus the two states the mockups do not draw but a
 * real run needs: work in progress and failure.
 *
 * The colour question is NOT asked up front on purpose: the skill reads the
 * pair from the cohort's Planna Cotta `color_scheme` and only asks when that
 * field is empty. Asking every time would override Planna.
 */

const POLL_MS = 1_200
const SUGGEST_DEBOUNCE_MS = 180

type Phase =
  | { kind: "prompt" }
  | { kind: "running"; step: string }
  | { kind: "colors"; courseTitle: string }
  | { kind: "done"; gammaUrl: string; colorPair: string; flags: string[] }
  | { kind: "failed"; error: string }

function phaseOf(state: RunState): Phase {
  switch (state.status) {
    case "running":
      return { kind: "running", step: state.step }
    case "needs-colors":
      return { kind: "colors", courseTitle: state.cohort.courseTitle }
    case "done":
      return {
        kind: "done",
        gammaUrl: state.result.gammaUrl,
        colorPair: state.result.colorPair,
        flags: state.result.flags,
      }
    case "failed":
      return { kind: "failed", error: state.error }
  }
}

async function readError(response: Response, fallback: string) {
  try {
    const body: unknown = await response.json()
    const error = (body as { error?: unknown } | null)?.error
    return typeof error === "string" ? error : fallback
  } catch {
    return fallback
  }
}

export function IntroMeetingFlow({
  firstName,
  email,
  fullName,
  heroes,
  onSignOut,
}: {
  firstName: string | null
  email: string | null
  fullName: string | null
  /** Resolved server-side from public/hero/ — see lib/hero-media.ts. */
  heroes: HeroMediaMap
  onSignOut: () => void
}) {
  const [phase, setPhase] = React.useState<Phase>({ kind: "prompt" })
  const [cohortCode, setCohortCode] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<ComboboxSuggestion[]>([])
  const [suggesting, setSuggesting] = React.useState(false)
  const [inputError, setInputError] = React.useState<string | null>(null)
  const [runId, setRunId] = React.useState<string | null>(null)
  const [schemes, setSchemes] = React.useState<ColorScheme[]>([])
  const [base, setBase] = React.useState<ColorBase | "">("")
  const [accent, setAccent] = React.useState<ColorAccent | "">("")
  const [busy, setBusy] = React.useState(false)

  const topBar = email ? (
    <AccountMenu email={email} name={fullName} onSignOut={onSignOut} />
  ) : null

  /* ---- cohort suggestions, debounced so a fast typist makes one request ---- */
  React.useEffect(() => {
    const query = cohortCode.trim()
    if (query.length === 0) {
      setSuggestions([])
      setSuggesting(false)
      return
    }

    setSuggesting(true)
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/cohorts?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!response.ok) return
        const body: { suggestions: CohortSuggestion[] } = await response.json()
        setSuggestions(
          body.suggestions.map((item) => ({
            value: item.cohortCode,
            detail: item.courseTitle,
          })),
        )
      } catch {
        // Aborted or offline: leave the previous list rather than blanking it.
      } finally {
        setSuggesting(false)
      }
    }, SUGGEST_DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [cohortCode])

  /* ---- poll while a run is in flight; stops the moment it is not ---- */
  const polling = runId !== null && phase.kind === "running"
  React.useEffect(() => {
    if (!polling || runId === null) return

    let cancelled = false
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/runs/${runId}`, { cache: "no-store" })
        if (cancelled) return
        if (!response.ok) {
          setPhase({ kind: "failed", error: await readError(response, "Lost track of this run.") })
          return
        }
        const body: { state: RunState } = await response.json()
        setPhase(phaseOf(body.state))
      } catch {
        if (!cancelled) {
          setPhase({ kind: "failed", error: "Could not reach the server. Check your connection." })
        }
      }
    }, POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [polling, runId])

  /* ---- the colour options come from the server, not a list in the UI ---- */
  const needsColors = phase.kind === "colors"
  React.useEffect(() => {
    if (!needsColors || schemes.length > 0) return

    let cancelled = false
    void (async () => {
      try {
        const response = await fetch("/api/color-schemes", { cache: "no-store" })
        if (!response.ok || cancelled) return
        const body: { schemes: ColorScheme[] } = await response.json()
        if (!cancelled) setSchemes(body.schemes)
      } catch {
        // Leave the dropdowns empty; the Go button stays disabled.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [needsColors, schemes.length])

  function reset() {
    setPhase({ kind: "prompt" })
    setRunId(null)
    setCohortCode("")
    setSuggestions([])
    setInputError(null)
    setBase("")
    setAccent("")
  }

  async function startRun(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = parseCohortCode(cohortCode)
    if (!code.ok) {
      setInputError(code.error ?? "Check the cohort code.")
      return
    }

    setInputError(null)
    setBusy(true)
    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cohortCode: code.value }),
      })
      if (!response.ok) {
        setInputError(await readError(response, "Could not start the run."))
        return
      }
      const body: { runId: string; state: RunState } = await response.json()
      setRunId(body.runId)
      setPhase(phaseOf(body.state))
    } catch {
      setInputError("Could not reach the server. Check your connection.")
    } finally {
      setBusy(false)
    }
  }

  async function submitColors(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (runId === null || base === "" || accent === "") return

    const scheme = toScheme(base, accent)
    if (!isColorScheme(scheme)) return

    setBusy(true)
    try {
      const response = await fetch(`/api/runs/${runId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scheme }),
      })
      if (!response.ok) {
        setPhase({ kind: "failed", error: await readError(response, "Could not use that pair.") })
        return
      }
      const body: { state: RunState } = await response.json()
      setPhase(phaseOf(body.state))
    } catch {
      setPhase({ kind: "failed", error: "Could not reach the server. Check your connection." })
    } finally {
      setBusy(false)
    }
  }

  if (phase.kind === "prompt" || phase.kind === "running") {
    const running = phase.kind === "running"
    return (
      <HeroStage {...heroes.greeting} topBar={topBar}>
        <HeroStageCopy>
          <Heading level="display" className="text-elvtr-dark capitalize">
            {/* Part of day comes from the viewer's clock, so the server render
                and the first client render legitimately differ. */}
            <span suppressHydrationWarning>
              {firstName
                ? `Good ${partOfDay(new Date())}, ${firstName}!`
                : `Good ${partOfDay(new Date())}!`}
            </span>
          </Heading>

          {running ? (
            <Text variant="lead" aria-live="polite">
              {phase.step}
            </Text>
          ) : (
            <>
              <Text variant="lead">Which cohort needs an intro meeting today?</Text>
              <form
                id="cohort-form"
                onSubmit={startRun}
                className="flex w-full flex-col items-center gap-[16px]"
              >
                <label className="sr-only" htmlFor="cohort-code">
                  Cohort code
                </label>
                <PillCombobox
                  id="cohort-code"
                  name="cohortCode"
                  value={cohortCode}
                  onValueChange={(next) => {
                    setCohortCode(next)
                    setInputError(null)
                  }}
                  suggestions={suggestions}
                  loading={suggesting}
                  emptyMessage="No cohort in Planna Cotta matches that yet."
                  placeholder="Start typing a cohort code…"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  autoFocus
                  disabled={busy}
                  aria-invalid={inputError ? true : undefined}
                  aria-describedby={inputError ? "cohort-code-error" : undefined}
                />
                {inputError ? (
                  <Text id="cohort-code-error" role="alert" className="text-elvtr-cola-latent">
                    {inputError}
                  </Text>
                ) : null}
              </form>
            </>
          )}
        </HeroStageCopy>

        <HeroStageActions>
          {/* The CTA sits outside the form and is wired to it by `form`, so
              Enter in the field and a click on the button take one path. */}
          {running ? (
            <Text variant="lead" className="text-elvtr-dark/50">
              Hang on, this takes a couple of minutes…
            </Text>
          ) : (
            <ColaButton type="submit" form="cohort-form" disabled={busy}>
              {busy ? "Starting…" : "Create!"}
            </ColaButton>
          )}
        </HeroStageActions>
      </HeroStage>
    )
  }

  if (phase.kind === "colors") {
    const baseOptions = basesIn(schemes, accent)
    const accentOptions = accentsIn(schemes, base)
    const complete = base !== "" && accent !== "" && isColorScheme(toScheme(base, accent))

    return (
      <HeroStage {...heroes.colors} topBar={topBar}>
        <HeroStageCopy>
          <Heading level="display" className="text-elvtr-dark capitalize">
            Oops, No Colors Yet!
          </Heading>
          <Text variant="lead">
            This course doesn&rsquo;t have a color pair in Planna Cotta.
            <br />
            Choose a primary and a secondary, and you&rsquo;re all set.
          </Text>
          <Text className="text-elvtr-dark/50">{phase.courseTitle}</Text>
          <form
            id="colors-form"
            onSubmit={submitColors}
            className="flex w-full max-w-[540px] flex-wrap items-center justify-center gap-[20px]"
          >
            <SwatchSelect
              id="primary-color"
              aria-label="Primary color"
              placeholder="Primary color"
              value={base}
              disabled={busy}
              onValueChange={(next) => setBase(next as ColorBase)}
              options={baseOptions.map((option) => ({
                value: option,
                label: colorLabel(option),
                color: colorSwatch(option),
              }))}
            />
            <SwatchSelect
              id="secondary-color"
              aria-label="Secondary color"
              placeholder="Secondary color"
              value={accent}
              disabled={busy}
              onValueChange={(next) => setAccent(next as ColorAccent)}
              options={accentOptions.map((option) => ({
                value: option,
                label: colorLabel(option),
                color: colorSwatch(option),
              }))}
            />
          </form>
        </HeroStageCopy>

        <HeroStageActions>
          <ColaButton type="submit" form="colors-form" disabled={busy || !complete}>
            {busy ? "Going…" : "Go!"}
          </ColaButton>
        </HeroStageActions>
      </HeroStage>
    )
  }

  if (phase.kind === "done") {
    return (
      <HeroStage {...heroes.done} topBar={topBar}>
        <HeroStageCopy>
          <Heading level="display" className="text-elvtr-dark capitalize">
            Ta-da!
          </Heading>
          <Text variant="lead">Your intro meeting is ready to go, honey.</Text>
          {phase.flags.length > 0 ? (
            <div className="flex w-full flex-col items-center gap-[12px]">
              {phase.flags.map((flag) => (
                <DisclaimerCard key={flag}>
                  {flag}
                </DisclaimerCard>
              ))}
            </div>
          ) : null}
        </HeroStageCopy>

        <HeroStageActions>
          <ColaButton asChild>
            <a href={phase.gammaUrl} target="_blank" rel="noopener noreferrer">
              Open Presentation
            </a>
          </ColaButton>
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer font-sans text-[25px] leading-[1.2] font-medium text-elvtr-dark/50 underline decoration-solid underline-offset-2 outline-none hover:text-elvtr-dark/70 focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40"
          >
            Create Another
          </button>
        </HeroStageActions>
      </HeroStage>
    )
  }

  return (
    <HeroStage {...heroes.door} topBar={topBar}>
      <HeroStageCopy>
        <Heading level="display" className="text-elvtr-dark capitalize">
          That Didn&rsquo;t Work
        </Heading>
        <DisclaimerCard role="alert">
          {phase.error}
        </DisclaimerCard>
      </HeroStageCopy>

      <HeroStageActions>
        <ColaButton onClick={reset}>Try Again</ColaButton>
      </HeroStageActions>
    </HeroStage>
  )
}
