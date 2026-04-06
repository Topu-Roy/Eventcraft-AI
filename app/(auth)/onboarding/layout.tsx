import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const profileResult = await fetchAuthQuery(api.profiles.getCurrent)
  const profile = profileResult.data

  if (profileResult.cause === "Unauthenticated") {
    redirect("/sign-in")
  }

  if (profile?.onboardingComplete === true) {
    redirect("/dashboard")
  }

  return <>{children}</>
}
