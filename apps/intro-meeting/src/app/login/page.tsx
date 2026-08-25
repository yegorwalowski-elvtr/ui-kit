import type { Metadata } from "next"
import {
  HeroStage,
  HeroStageActions,
  HeroStageCopy,
  Heading,
  Text,
} from "@elvtr/ui-kit"

import { loginWithGoogle } from "./actions"
import { LoginButton } from "./login-button"

/*
 * The Figma screens do not include a sign-in step, so this one is built from the
 * same parts: mauve HeroStage, the 3D_icons "welcome-door" component as the hero
 * (a square library icon, hence imageFit="contain"), display heading, lead line,
 * Cola Orange CTA.
 */

export const metadata: Metadata = {
  title: "Sign in · Intro Meeting",
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
    <HeroStage image="/hero/login.png" imageFit="contain" layout="center">
      <HeroStageCopy>
        <Heading level="display" className="text-elvtr-dark capitalize">
          Intro Meetings, On Tap
        </Heading>
        <Text variant="lead">
          Sign in with your ELVTR account and build a cohort&rsquo;s intro meeting deck.
        </Text>
        {error ? (
          <Text
            role="alert"
            className="max-w-[522px] rounded-[12px] bg-elvtr-cream px-[20px] py-[12px] text-elvtr-dark"
          >
            {error}
          </Text>
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
