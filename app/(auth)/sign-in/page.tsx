import { api } from "@/convex/_generated/api"
import { AnimatedSignInTitle } from "@/features/auth/components/AnimatedSignInTitle"
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
    <div className="relative flex h-[93dvh] items-center justify-center overflow-hidden bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <AnimatedSignInTitle />

        <div className="rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">© 2026 EventCraft. All rights reserved.</p>
      </div>
    </div>
  )
}
