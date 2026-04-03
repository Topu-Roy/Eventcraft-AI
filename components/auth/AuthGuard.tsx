import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"

type AuthGuardProps = {
  children: React.ReactNode
  requireAuth?: boolean
  requireOnboardingComplete?: boolean
}

/**
 * Server component that guards routes based on authentication and onboarding status.
 *
 * Redirect logic:
 * - No valid session + requireAuth=true → redirect to /sign-in
 * - Valid session + onboarding incomplete + requireOnboardingComplete=true → redirect to /onboarding
 * - On any error, fail open (let user through, log the failure)
 */
export async function AuthGuard({
  children,
  requireAuth = true,
  requireOnboardingComplete = true,
}: AuthGuardProps) {
  if (!requireAuth) {
    return <>{children}</>
  }

  let authed: boolean
  try {
    authed = await isAuthenticated()
  } catch (error) {
    console.error("AuthGuard: isAuthenticated check failed, failing open:", error)
    return <>{children}</>
  }

  if (!authed) {
    redirect("/sign-in")
  }

  if (requireOnboardingComplete) {
    try {
      const user = await fetchAuthQuery(api.users.getCurrentUser)

      if (!user?.onboardingComplete) {
        redirect("/onboarding")
      }
    } catch (error) {
      console.error("AuthGuard: onboarding check failed, failing open:", error)
      return <>{children}</>
    }
  }

  return <>{children}</>
}
