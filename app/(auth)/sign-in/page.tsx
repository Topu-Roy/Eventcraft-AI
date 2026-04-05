import { api } from "@/convex/_generated/api"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

export default async function LoginPage() {
  const authed = await isAuthenticated()

  if (authed) {
    const profileResult = await tryCatch(fetchAuthQuery(api.profiles.getCurrent))
    const profile = profileResult.data?.data

    if (profile?.onboardingComplete) {
      redirect("/explore")
    }

    redirect("/onboarding")
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
