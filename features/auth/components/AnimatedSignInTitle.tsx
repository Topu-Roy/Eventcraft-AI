"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export function AnimatedSignInTitle() {
  const scope = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const globCtx = gsap.context(() => {
      gsap.set(".animate", { opacity: 0, y: 10 })

      gsap.timeline().to(".animate", {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "power1.in",
      })
    }, scope)

    return () => {
      globCtx.revert()
    }
  }, [])

  return (
    <div ref={scope} className="flex flex-col items-center space-y-3">
      <div className="animate flex size-16 items-center justify-center rounded-2xl from-primary to-primary/60 shadow-lg shadow-primary/25">
        <svg
          className="size-8 text-primary-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="animate text-3xl font-bold tracking-tight">EventCraft</h2>
        <p className="animate mt-1 text-sm text-muted-foreground">AI-Powered Event Discovery</p>
      </div>
    </div>
  )
}
