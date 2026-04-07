"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"

export function DashboardAnimations({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dash-header", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })

      gsap.from(".dash-stat", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.3,
        ease: "power3.out",
      })

      gsap.from(".dash-section", {
        y: 15,
        opacity: 0,
        duration: 0.4,
        stagger: 0.15,
        delay: 0.6,
        ease: "power3.out",
      })

      gsap.from(".dash-event-card", {
        y: 10,
        opacity: 0,
        duration: 0.35,
        stagger: 0.08,
        delay: 0.9,
        ease: "power2.out",
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return <div ref={ref}>{children}</div>
}
