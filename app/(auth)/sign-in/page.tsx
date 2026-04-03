import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage() {
  const authed = await isAuthenticated()

  if (authed) {
    const userResult = await tryCatch(fetchAuthQuery(api.users.getCurrentUser))
    if (userResult.data?.onboardingComplete) {
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
