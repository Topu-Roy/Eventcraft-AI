import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated()

  if (authed) {
    const profileResult = await tryCatch(fetchAuthQuery(api.profiles.getCurrent))
    const profile = profileResult.data?.data

    if (profile?.onboardingComplete) {
      redirect("/explore")
    }

    redirect("/onboarding")
  }

  return <>{children}</>
}
