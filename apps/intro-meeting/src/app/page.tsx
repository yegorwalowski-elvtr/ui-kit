import { auth } from "@/auth"
import { IntroMeetingFlow } from "@/components/intro-meeting-flow"
import { SessionBar } from "@/components/session-bar"
import { firstNameFrom } from "@/lib/greeting"
import { currentUserEmail } from "@/lib/session"

export default async function Page() {
  // `currentUserEmail` is what the run API attributes a run to, so the bar shows
  // the same identity — including the placeholder used in preview mode.
  const email = await currentUserEmail()
  const session = await auth()

  return (
    <div className="relative">
      {email ? <SessionBar email={email} /> : null}
      <IntroMeetingFlow firstName={firstNameFrom(session?.user?.name, email)} />
    </div>
  )
}
