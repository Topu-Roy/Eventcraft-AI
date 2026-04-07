"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ArrowRight, CheckCircle, Smartphone, Sparkles, Ticket } from "lucide-react"
import Link from "next/link"

const steps = [
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

const STEP_ICONS = [Sparkles, Ticket, Smartphone, CheckCircle]

export function ClientHomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(blob1Ref.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      })

      gsap.from(blob2Ref.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        delay: 0.5,
        ease: "power3.out",
      })

      gsap.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        delay: 0.8,
        ease: "power3.out",
      })

      gsap.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 1,
        ease: "power3.out",
      })

      gsap.from(descRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 1.2,
        ease: "power3.out",
      })

      gsap.from(buttonsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 1.4,
        ease: "power3.out",
      })

      gsap.from(".step-card", {
        scale: 0.5,
        opacity: 0,
        duration: 0.5,
        stagger: 0.15,
        delay: 1.6,
        ease: "back.out(1.7)",
      })

      gsap.from(".connector-line", {
        scaleX: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        delay: 2.2,
        ease: "power2.out",
      })

      gsap.to(blob1Ref.current, {
        x: "random(-30, 30)",
        y: "random(-30, 30)",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      gsap.to(blob2Ref.current, {
        x: "random(-20, 20)",
        y: "random(-20, 20)",
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-svh overflow-hidden bg-background">
      <div ref={blob1Ref} className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/20 blur-3xl" />
      </div>
      <div ref={blob2Ref} className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute right-1/4 bottom-1/4 size-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col">
        <main className="flex flex-1 flex-col items-center justify-center px-6 lg:px-12">
          <div className="grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-8">
              <div
                ref={badgeRef}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
              >
                <Sparkles className="size-3.5" />
                AI-powered event creation
              </div>

              <h1 ref={titleRef} className="text-5xl font-bold tracking-tight lg:text-7xl">
                Events, at the
                <br />
                <span className="text-primary">speed of thought.</span>
              </h1>

              <p ref={descRef} className="max-w-md text-lg text-muted-foreground">
                Describe your event in plain language. AI builds the draft. Tweak. Publish. Done in seconds — not
                hours.
              </p>

              <div ref={buttonsRef} className="flex flex-col gap-3 sm:flex-row">
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
                {steps.map((step, index) => {
                  const Icon = STEP_ICONS[index]
                  const isLast = index === steps.length - 1
                  return (
                    <div key={index} className="step-wrapper relative w-full">
                      <div className="step-card flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="size-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-semibold">{step.title}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      {!isLast && (
                        <div className="flex h-6 items-center justify-center">
                          <div className="connector-line h-full w-0.5 rounded-full bg-gradient-to-b from-primary/50 to-primary" />
                        </div>
                      )}
                    </div>
                  )
                })}
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
