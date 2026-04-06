import { api } from "@/convex/_generated/api"
import { ArrowRight, QrCode, Sparkles, Ticket } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"

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
              <div className="relative rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
                    <div className="h-8 w-3/4 rounded-lg bg-foreground/10" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                    <div className="h-3 w-4/6 rounded bg-muted" />
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                      <Sparkles className="size-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-2 w-16 rounded bg-muted/60" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                      <Ticket className="size-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-2 w-16 rounded bg-muted/60" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                      <QrCode className="size-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-2 w-16 rounded bg-muted/60" />
                    </div>
                  </div>
                </div>
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
