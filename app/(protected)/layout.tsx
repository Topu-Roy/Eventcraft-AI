import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data, error } = await tryCatch(fetchAuthQuery(api.profiles.getCurrent))

  if (error || !data || data.error) {
    redirect("/sign-in")
  }

  if (!data.data?.onboardingComplete) {
    redirect("/onboarding")
  }

  return <>{children}</>
}
