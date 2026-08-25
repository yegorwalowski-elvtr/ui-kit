import Link from "next/link"
import {
  ColaButton,
  HeroStage,
  HeroStageActions,
  HeroStageCopy,
  Heading,
  Text,
} from "@elvtr/ui-kit"

/**
 * Where the mock runner's "Open Presentation" lands. It exists so the button is
 * honest: with the mock runner wired up, no Gamma deck was ever generated.
 */
export default async function MockDeckPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>
}) {
  const { cohort } = await searchParams

  return (
    <HeroStage image="/hero/door.png">
      <HeroStageCopy>
        <Heading level="display" className="text-elvtr-dark capitalize">
          No Deck Here Yet
        </Heading>
        <Text variant="lead">
          {cohort ? `${cohort} ran against the mock runner, ` : "That run used the mock runner, "}
          so nothing was generated in Gamma.
          <br />
          Wire <code className="font-sans">src/lib/runner/index.ts</code> to a real
          implementation to get a live deck.
        </Text>
      </HeroStageCopy>
      <HeroStageActions>
        <ColaButton asChild>
          <Link href="/">Back</Link>
        </ColaButton>
      </HeroStageActions>
    </HeroStage>
  )
}
