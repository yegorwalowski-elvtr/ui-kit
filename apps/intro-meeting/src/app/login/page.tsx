import type { Metadata } from "next"
import {
  DisclaimerCard,
  HeroStage,
  HeroStageActions,
  HeroStageCopy,
  Heading,
  Text,
} from "@elvtr/ui-kit"

import { loginWithGoogle } from "./actions"
import { LoginButton } from "./login-button"

/*
 * Desktop-9 of "Intro Meeting UI" (node 5725:11407): the ceramic cat-and-ball
 * hero, "Welcome to Meetball" as a 56px display line, a 30px support line, and
 * the Cola Orange "Log In".
 */

export const metadata: Metadata = {
  title: "Sign in · Meetball",
  description: "Sign in with your ELVTR Google account.",
  robots: { index: false, follow: false },
}

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "That account can't get in. Use your verified @elvtr.com Google Workspace account.",
  OAuthAccountNotLinked: "This email is already connected through another sign-in method.",
  Configuration: "Sign-in is still being configured. Try again in a moment.",
}

function safeCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string") return "/"
  if (!value.startsWith("/") || value.startsWith("//")) return "/"
  return value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string | string[] }>
}) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(params.callbackUrl)
  const error = params.error
    ? (ERROR_MESSAGES[params.error] ??
      "We couldn't complete the sign-in. Try again with your ELVTR account.")
    : null

  return (
    <HeroStage image="/hero/login.png">
      <HeroStageCopy>
        <Heading level="display" className="text-elvtr-dark capitalize">
          Welcome to Meetball
        </Heading>
        <Text variant="lead">
          Type a cohort, get its intro meeting deck. Sign in with your ELVTR account to start.
        </Text>
        {error ? (
          <DisclaimerCard className="max-w-[760px]" role="alert">
            {error}
          </DisclaimerCard>
        ) : null}
      </HeroStageCopy>

      <HeroStageActions>
        <form action={loginWithGoogle}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <LoginButton />
        </form>
        <Text className="text-elvtr-dark/50">Verified @elvtr.com accounts only.</Text>
      </HeroStageActions>
    </HeroStage>
  )
}
