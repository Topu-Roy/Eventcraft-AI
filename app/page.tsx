import { api } from "@/convex/_generated/api"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import { ClientHomePage } from "@/components/ClientHomePage"

export const metadata: Metadata = {
  title: "EventCraft AI — Events at the speed of thought",
  description:
    "AI-powered event creation. Describe your event in plain language. AI builds the draft. Tweak. Publish. Done in seconds.",
}

export default async function HomePage() {
  const { data } = await tryCatch(fetchAuthQuery(api.profiles.getCurrent))

  if (data) {
    if (!data.data?.onboardingComplete) {
      redirect("/onboarding")
    }
  }

  return <ClientHomePage />
}
