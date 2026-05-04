"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ClientHomePage } from "@/components/ClientHomePage"

export default function HomePage() {
  const { isLoading, isAuthenticated, needsOnboarding } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        return
      }
      if (needsOnboarding) {
        router.replace("/onboarding")
      } else {
        router.replace("/explore")
      }
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router])

  if (isLoading) {
    return null
  }

  if (isAuthenticated && !needsOnboarding) {
    return null
  }

  return <ClientHomePage />
}