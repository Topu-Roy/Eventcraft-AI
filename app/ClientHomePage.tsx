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

export function ClientHomePage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Floating Background Blobs
      gsap.to(".bg-blob", {
        x: "random(-40, 40)",
        y: "random(-40, 40)",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5,
      })

      // 2. Main Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(".hero-elem", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
      })

        // Cards animate TO their final state (opacity 1, x 0)
        .to(
          ".step-card",
          {
            x: 0,
            opacity: 1,
            autoAlpha: 1, // Handles visibility + opacity
            duration: 0.6,
            stagger: 0.15,
          },
          "-=0.4"
        )

        .from(
          ".timeline-line",
          {
            scaleY: 0,
            transformOrigin: "top",
            duration: 1,
          },
          "-=0.5"
        )

      // 3. Constant Pulse Animation
      gsap.to(".traveling-dot", {
        top: "100%",
        duration: 3,
        repeat: -1,
        ease: "none",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute top-[5%] -left-[5%] opacity-20">
        <div className="bg-blob size-[400px] rounded-full bg-primary/30 blur-[100px]" />
      </div>
      <div className="pointer-events-none absolute -right-[5%] bottom-[5%] opacity-20">
        <div className="bg-blob size-[400px] rounded-full bg-blue-500/20 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col">
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
          <div className="grid w-full items-start gap-16 lg:grid-cols-2 lg:gap-12">
            {/* Left: Content */}
            <div className="flex flex-col justify-center space-y-8 py-10">
              <div className="hero-elem inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md">
                <Sparkles className="size-4" />
                AI-powered event creation
              </div>

              <h1 className="hero-elem text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                Events, at the
                <br />
                <span className="bg-linear-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                  speed of thought.
                </span>
              </h1>

              <p className="hero-elem max-w-md text-lg leading-relaxed text-muted-foreground">
                Describe your event in plain language. AI builds the draft. Tweak. Publish. Done in seconds.
              </p>

              <div className="hero-elem flex flex-col gap-4 pt-4 sm:flex-row">
                <Link
                  href="/sign-in"
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-foreground px-8 text-base font-semibold text-background transition-all hover:bg-foreground/90 active:scale-95"
                >
                  Get Started
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-8 text-base font-medium backdrop-blur-sm transition-all hover:bg-muted"
                >
                  View Demo
                </Link>
              </div>
            </div>

            {/* Right: Steps */}
            <div className="relative w-full py-10 lg:pl-10">
              <div className="absolute inset-0 -rotate-2 rounded-[40px] bg-linear-to-br from-primary/5 to-transparent blur-3xl" />

              <div className="relative flex flex-col gap-6">
                {/* Vertical Timeline Line */}
                <div className="timeline-line absolute top-14 bottom-6 left-[31px] w-[2px] bg-muted">
                  <div className="traveling-dot absolute top-0 -left-[2px] h-12 w-[6px] -translate-y-full rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                </div>

                {steps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={index}
                      // Fixed: Added opacity-0 and translate-x-8 to prevent flash/disappearance
                      className="step-card group relative flex translate-x-8 items-start gap-6 rounded-2xl border border-border/50 bg-card/40 p-6 opacity-0 backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card/60"
                    >
                      <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background shadow-sm group-hover:border-primary/50 group-hover:text-primary">
                        <Icon className="size-6" />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <h3 className="text-lg font-bold tracking-tight">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/40 bg-background/50 px-6 py-8 backdrop-blur-lg lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2026 EventCraft AI. All rights reserved.</p>
            <div className="flex gap-8 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
