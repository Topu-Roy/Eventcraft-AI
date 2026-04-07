"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"

type FadeInProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className = "relative z-0", delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay,
        ease: "power3.out",
      })
    }, ref)
    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function StaggerIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (ref.current) {
        gsap.from(ref.current.querySelectorAll(":scope > *"), {
          y: 15,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power3.out",
        })
      }
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function ScaleIn({ children, className = "", delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        delay,
        ease: "back.out(1.7)",
      })
    }, ref)
    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
