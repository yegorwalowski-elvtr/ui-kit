import { signOutAction } from "@/app/actions"

/**
 * Who is signed in, and the way out. Deliberately quiet and out of the way —
 * the Figma screens are a single centred column and nothing should compete
 * with the hero.
 */
export function SessionBar({ email }: { email: string }) {
  return (
    <div className="absolute top-0 right-0 z-10 flex items-center gap-[16px] p-[24px] font-sans text-[14px] leading-none font-medium text-elvtr-dark/50">
      <span className="max-w-[40vw] truncate" title={email}>
        {email}
      </span>
      <form action={signOutAction}>
        <button
          type="submit"
          className="cursor-pointer rounded-[8px] underline decoration-solid underline-offset-2 outline-none hover:text-elvtr-dark focus-visible:ring-[3px] focus-visible:ring-elvtr-cola-latent/40"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
