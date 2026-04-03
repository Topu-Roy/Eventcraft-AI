import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage() {
  const authed = await isAuthenticated()

  if (authed) {
    try {
      const user = await fetchAuthQuery(api.users.getCurrentUser)
      if (user?.onboardingComplete) {
        redirect("/explore")
      } else {
        redirect("/onboarding")
      }
    } catch {
      redirect("/onboarding")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
