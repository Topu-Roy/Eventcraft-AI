"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ArrowRight, CheckCircle, Smartphone, Sparkles, Ticket } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

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
  const footerRef = useRef<HTMLElement>(null)
  const globRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      // 4. Subtle icon hover effect
      gsap.set(".step-icon-wrapper", { scale: 1 })
      gsap.set(".step-card", { scale: 1 })

      // 5. Footer links stagger
      gsap.from("footer a", {
        y: 10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        delay: 2.5,
        ease: "power2.out",
      })

      // 6. Add hover animations for buttons
      gsap.to(".btn-primary", {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      })
    }, containerRef)

    const globCtx = gsap.context(() => {
      // 1. Floating Background Blobs - different speeds for different sizes
      gsap.to(".bg-blob:nth-child(1)", {
        x: "random(-50, 50)",
        y: "random(-30, 30)",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to(".bg-blob:nth-child(2)", {
        x: "random(-30, 30)",
        y: "random(-40, 40)",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to(".bg-blob:nth-child(3)", {
        x: "random(-20, 20)",
        y: "random(-25, 25)",
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, globRef)

    const footerCtx = gsap.context(() => {
      // Footer links stagger
      gsap.from("footer a", {
        y: 10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        delay: 1.5,
        ease: "power2.out",
      })
    }, footerRef)

    return () => {
      ctx.revert()
      footerCtx.revert()
      globCtx.revert()
    }
  }, [])

  return (
    <div className="relative overflow-x-hidden bg-background text-foreground lg:overflow-hidden">
      <div ref={globRef} className="overflow-hidden">
        <div className="pointer-events-none absolute inset-0 top-[10%] -left-[10%] opacity-50">
          <div className="bg-blob size-[500px] rounded-full bg-primary/20 blur-[120px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 -right-[15%] bottom-[20%] opacity-30">
          <div className="bg-blob size-[350px] rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 top-[20%] left-[60%] opacity-30">
          <div className="bg-blob size-[850px] rounded-full bg-primary/20 blur-[90px]" />
        </div>
      </div>

      <main
        ref={containerRef}
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-12 lg:h-[85dvh] lg:px-12"
      >
        <div className="grid w-full items-start gap-16 text-center lg:grid-cols-2 lg:gap-12 lg:text-left">
          {/* Left: Content */}
          <div className="flex flex-col items-center justify-center space-y-8 py-10 lg:items-start">
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

            <div className="hero-elem flex w-full max-w-xl flex-col gap-4 pt-4 sm:flex-row">
              <Link href="/sign-in" className="w-full">
                <Button className="group btn-primary flex h-14 w-full flex-1 items-center justify-center gap-2 px-8 text-base font-semibold transition-all active:scale-95">
                  Get Started
                  <ArrowRight className="btn-arrow size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full">
                <Button
                  variant={"outline"}
                  className="btn-secondary group flex h-14 w-full flex-1 items-center justify-center gap-2 px-8 text-base font-medium backdrop-blur-sm transition-all"
                >
                  <span className="transition-transform group-hover:scale-105">Sign In</span>
                </Button>
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

      <footer
        ref={footerRef}
        className="border-t border-border/40 bg-background/50 px-6 py-8 backdrop-blur-lg lg:px-12"
      >
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
  )
}
