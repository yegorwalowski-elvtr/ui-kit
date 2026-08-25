"use server"

import { signIn } from "@/auth"

/** Only same-origin paths — never bounce a signed-in user to another host. */
function safeCallbackUrl(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/"
  if (!value.startsWith("/") || value.startsWith("//")) return "/"
  return value
}

export async function loginWithGoogle(formData: FormData) {
  await signIn("google", {
    redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
  })
}
