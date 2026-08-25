"use client"

import * as React from "react"
import {
  ColaButton,
  HeroStage,
  HeroStageActions,
  HeroStageCopy,
  Heading,
  PillInput,
  PillSelect,
  Text,
} from "@elvtr/ui-kit"

import { parseCohortCode } from "@/lib/cohort-code"
import {
  accentsFor,
  basesFor,
  colorLabel,
  isColorScheme,
  toScheme,
  type ColorAccent,
  type ColorBase,
} from "@/lib/colors"
import { partOfDay } from "@/lib/greeting"
import type { RunState } from "@/lib/runner/types"

/*
 * The four Intro Meeting screens from Core Brand Guides 2.0 ("Intro Meeting
 * UI", nodes 5709:5198 / 5715:6596 / 5715:6619), plus the two states the
 * mockups do not cover but a real run needs: work-in-progress and failure.
 *
 * The colour question is NOT asked up front on purpose — the skill reads the
 * pair from the cohort's Planna Cotta `color_scheme` and only asks when that
 * field is empty. Asking every time would override Planna.
 */

const POLL_MS = 1_200

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

export function IntroMeetingFlow({ firstName }: { firstName: string | null }) {
  const [phase, setPhase] = React.useState<Phase>({ kind: "prompt" })
  const [cohortCode, setCohortCode] = React.useState("")
  const [inputError, setInputError] = React.useState<string | null>(null)
  const [runId, setRunId] = React.useState<string | null>(null)
  const [base, setBase] = React.useState<ColorBase | "">("")
  const [accent, setAccent] = React.useState<ColorAccent | "">("")
  const [busy, setBusy] = React.useState(false)

  // Poll while a run is in flight. Stops as soon as the run needs an answer,
  // finishes or fails, so an idle tab makes no requests.
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

  function reset() {
    setPhase({ kind: "prompt" })
    setRunId(null)
    setCohortCode("")
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
      <HeroStage image="/hero/greeting.png">
        <HeroStageCopy>
          <Heading level="display" className="text-elvtr-dark capitalize">
            {/* Part of day comes from the viewer's clock, so the server render
                and the client render legitimately differ on the first paint. */}
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
                <PillInput
                  id="cohort-code"
                  name="cohortCode"
                  value={cohortCode}
                  onChange={(event) => {
                    setCohortCode(event.target.value)
                    setInputError(null)
                  }}
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
    const accentOptions = accentsFor(base)
    const baseOptions = basesFor(accent)
    const complete = base !== "" && accent !== "" && isColorScheme(toScheme(base, accent))

    return (
      <HeroStage image="/hero/colors.png">
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
            className="flex w-full max-w-[522px] flex-wrap items-center justify-center gap-[12px]"
          >
            <PillSelect
              placeholder="Primary color"
              aria-label="Primary color"
              value={base}
              disabled={busy}
              onChange={(event) => setBase(event.target.value as ColorBase)}
              options={baseOptions.map((option) => ({
                value: option,
                label: colorLabel(option),
              }))}
            />
            <PillSelect
              placeholder="Secondary color"
              aria-label="Secondary color"
              value={accent}
              disabled={busy}
              onChange={(event) => setAccent(event.target.value as ColorAccent)}
              options={accentOptions.map((option) => ({
                value: option,
                label: colorLabel(option),
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
      <HeroStage image="/hero/done.png" layout="center">
        <HeroStageCopy>
          <Heading level="display" className="text-elvtr-dark capitalize">
            Ta-da!
          </Heading>
          <Text variant="lead">Your intro meeting is ready to go, honey</Text>
          {phase.flags.length > 0 ? (
            <ul className="flex max-w-[720px] flex-col gap-[8px] text-left">
              {phase.flags.map((flag) => (
                <li
                  key={flag}
                  className="rounded-[12px] bg-elvtr-cream px-[20px] py-[12px] font-sans text-[16px] leading-[1.3] font-medium text-elvtr-dark"
                >
                  {flag}
                </li>
              ))}
            </ul>
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
            className="cursor-pointer font-sans text-[24px] leading-[1.2] font-medium text-elvtr-dark/50 underline decoration-solid underline-offset-2 outline-none hover:text-elvtr-dark/70 focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40"
          >
            Create Another
          </button>
        </HeroStageActions>
      </HeroStage>
    )
  }

  return (
    <HeroStage image="/hero/failed.png" imageFit="contain" layout="center">
      <HeroStageCopy>
        <Heading level="display" className="text-elvtr-dark capitalize">
          That Didn&rsquo;t Work
        </Heading>
        <Text variant="lead" role="alert">
          {phase.error}
        </Text>
      </HeroStageCopy>

      <HeroStageActions>
        <ColaButton onClick={reset}>Try Again</ColaButton>
      </HeroStageActions>
    </HeroStage>
  )
}
