import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

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

  const authResult = await tryCatch(isAuthenticated())
  if (authResult.error) {
    console.error("AuthGuard: isAuthenticated check failed, failing open:", authResult.error)
    return <>{children}</>
  }

  if (!authResult.data) {
    redirect("/sign-in")
  }

  if (requireOnboardingComplete) {
    const profileResult = await fetchAuthQuery(api.profiles.getCurrent)
    if (profileResult.data?.onboardingComplete) {
      return <>{children}</>
    }
    redirect("/onboarding")
  }

  return <>{children}</>
}
