"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function useAuth() {
  const profileResult = useQuery(api.profiles.getCurrent)

  const isLoading = profileResult === undefined
  const isAuthenticated = !!profileResult && !profileResult.error
  const profile = isAuthenticated ? profileResult.data : null
  const needsOnboarding = isAuthenticated && profile && !profile.onboardingComplete

  return { isLoading, isAuthenticated, profile, needsOnboarding }
}