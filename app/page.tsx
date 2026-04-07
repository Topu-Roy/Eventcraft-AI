import { api } from "@/convex/_generated/api"
import { ArrowDown, ArrowRight, CheckCircle, Smartphone, Sparkles, Ticket } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"

const STEPS = [
  {
    icon: Sparkles,
    title: "Create with AI",
    description: "Describe your event in plain language. AI builds the draft.",
  },
  {
    icon: Ticket,
    title: "Get Ticket",
    description: "Attendees receive instant QR-coded tickets on their phone.",
  },
  {
    icon: Smartphone,
    title: "Scan Ticket",
    description: "Scan tickets directly from attendee phones at the door.",
  },
  {
    icon: CheckCircle,
    title: "Verify Check-in",
    description: "Real-time verification. Instant check-in. No paper needed.",
  },
]

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

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 size-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-80 animate-pulse rounded-full bg-primary/10 blur-3xl delay-700" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col">
        <main className="flex flex-1 flex-col items-center justify-center px-6 lg:px-12">
          <div className="grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                AI-powered event creation
              </div>

              <h1 className="text-5xl font-bold tracking-tight lg:text-7xl">
                Events, at the
                <br />
                <span className="text-primary">speed of thought.</span>
              </h1>

              <p className="max-w-md text-lg text-muted-foreground">
                Describe your event in plain language. AI builds the draft. Tweak. Publish. Done in seconds — not
                hours.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sign-in"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  View Demo
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 -rotate-6 rounded-3xl bg-linear-to-br from-primary/30 to-primary/5 blur-2xl" />
              <div className="relative flex flex-col items-center">
                {STEPS.map((step, index) => (
                  <div key={index} className="relative w-full">
                    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <step.icon className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="flex justify-center py-3">
                        <ArrowDown className="size-6 text-primary/50" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t px-6 py-4 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>© 2026 EventCraft AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/sign-in" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/sign-in" className="hover:text-foreground">
                About
              </Link>
              <Link href="/sign-in" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
