import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

/*
 * Corporate sign-in, identical in policy to Photo Booth (photo-booth/src/auth.ts):
 * Google OAuth narrowed to VERIFIED @elvtr.com Google Workspace accounts.
 *
 * `hd` on the authorization request only pre-filters the account chooser — it is
 * a hint, not a guarantee — so the real gate is the `signIn` callback below,
 * which re-checks the ID token's `hd`, `email_verified` and email domain.
 */

const CORPORATE_DOMAIN = "elvtr.com"

function isCorporateEmail(email: string | null | undefined) {
  return email?.toLowerCase().endsWith(`@${CORPORATE_DOMAIN}`) ?? false
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      authorization: {
        params: {
          hd: CORPORATE_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false

      return (
        profile?.email_verified === true &&
        profile?.hd === CORPORATE_DOMAIN &&
        isCorporateEmail(profile?.email)
      )
    },
    authorized({ auth: session, request }) {
      const isAuthorized =
        Boolean(session?.user) && isCorporateEmail(session?.user?.email)

      if (isAuthorized) return true

      const loginUrl = new URL("/login", request.nextUrl)
      loginUrl.searchParams.set(
        "callbackUrl",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      )

      return Response.redirect(loginUrl)
    },
  },
})
