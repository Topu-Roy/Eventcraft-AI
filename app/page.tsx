import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { ClientHomePage } from "./ClientHomePage"

export const metadata = {
  title: "EventCraft AI — Events at the speed of thought",
  description:
    "AI-powered event creation. Describe your event in plain language. AI builds the draft. Tweak. Publish. Done in seconds.",
}

export default async function HomePage() {
  const authed = await isAuthenticated()

  if (authed) {
    const profileResult = await fetchAuthQuery(api.profiles.getCurrent)
    if (profileResult.data?.onboardingComplete) {
      redirect("/explore")
    }
    redirect("/onboarding")
  }

  return <ClientHomePage />
}
