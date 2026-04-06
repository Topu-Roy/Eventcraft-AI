import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const result = await tryCatch(fetchAuthQuery(api.profiles.getCurrent))

  if (result.error || !result.data || result.data.error) {
    redirect("/sign-in")
  }

  const profile = result.data.data
  if (!profile?.onboardingComplete) {
    redirect("/onboarding")
  }

  return <>{children}</>
}
