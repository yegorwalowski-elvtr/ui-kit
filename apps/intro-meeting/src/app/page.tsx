import { auth } from "@/auth"
import { signOutAction } from "@/app/actions"
import { IntroMeetingFlow } from "@/components/intro-meeting-flow"
import { firstNameFrom } from "@/lib/greeting"
import { currentUserEmail } from "@/lib/session"

export default async function Page() {
  // `currentUserEmail` is what the run API attributes a run to, so the account
  // chip shows the same identity — including the preview-mode placeholder.
  const email = await currentUserEmail()
  const session = await auth()
  const fullName = session?.user?.name ?? null

  return (
    <IntroMeetingFlow
      firstName={firstNameFrom(fullName, email)}
      fullName={fullName}
      email={email}
      onSignOut={signOutAction}
    />
  )
}
