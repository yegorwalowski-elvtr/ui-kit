"use client"

import { useFormStatus } from "react-dom"
import { BrandIcon, ColaButton } from "@elvtr/ui-kit"

export function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <ColaButton type="submit" disabled={pending}>
      {pending ? "Opening Google…" : "Log In with Google"}
      {/* Desktop-9 node 5742:11466: a 24px vuesax-bulk google mark in Cola
          Orange Signal, 10px after the label. */}
      <BrandIcon name="google" size={24} />
    </ColaButton>
  )
}
