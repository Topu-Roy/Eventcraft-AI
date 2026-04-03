import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"

/**
 * Fetches the current user's onboarding document.
 * Returns null if no document exists or user is not authenticated.
 */
export function useOnboarding() {
  return useQuery(api.onboarding.get)
}
