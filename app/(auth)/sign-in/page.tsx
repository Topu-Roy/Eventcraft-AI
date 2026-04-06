import { api } from "@/convex/_generated/api"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"

export const metadata = {
  title: "Sign In — EventCraft AI",
  description: "Sign in to EventCraft AI to create and discover events.",
}

export default async function LoginPage() {
  const authed = await isAuthenticated()

  if (authed) {
    const profileResult = await fetchAuthQuery(api.profiles.getCurrent)
    const profile = profileResult.data

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
