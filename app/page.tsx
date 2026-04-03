import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

export default async function HomePage() {
  const authed = await isAuthenticated()

  if (authed) {
    const userResult = await tryCatch(fetchAuthQuery(api.users.getCurrentUser))
    if (userResult.data?.onboardingComplete) {
      redirect("/explore")
    }
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">AI Event Manager</h1>
        <p className="mt-4 text-muted-foreground">Discover, create, and manage events powered by AI.</p>
        <a
          href="/sign-in"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
        </a>
      </div>
    </div>
  )
}
