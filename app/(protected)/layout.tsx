"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, needsOnboarding } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in")
    } else if (!isLoading && isAuthenticated && needsOnboarding) {
      router.replace("/onboarding")
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router])

  if (isLoading || !isAuthenticated || needsOnboarding) {
    return null
  }

  return <>{children}</>
}