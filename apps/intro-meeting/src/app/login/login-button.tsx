"use client"

import { useFormStatus } from "react-dom"
import { ColaButton } from "@elvtr/ui-kit"

export function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <ColaButton type="submit" disabled={pending}>
      {pending ? "Opening Google…" : "Log In with Google"}
    </ColaButton>
  )
}
