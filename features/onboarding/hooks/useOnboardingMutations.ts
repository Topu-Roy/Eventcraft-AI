import { useMutation } from "@tanstack/react-query"
import { api } from "@/convex/_generated/api"
import { useMutation as useConvexMutation } from "convex/react"

/**
 * Mutation hook for saving step one (interests) data.
 */
export function useSaveStepOne() {
  const saveStepOne = useConvexMutation(api.onboarding.saveStepOne)

  return useMutation({
    mutationFn: async ({ interests }: { interests: string[] }) => {
      return await saveStepOne({ interests })
    },
  })
}

/**
 * Mutation hook for saving step two (location) data.
 */
export function useSaveStepTwo() {
  const saveStepTwo = useConvexMutation(api.onboarding.saveStepTwo)

  return useMutation({
    mutationFn: async ({
      city,
      country,
      countryCode,
      lat,
      lng,
      timezone,
    }: {
      city: string
      country: string
      countryCode: string
      lat: number
      lng: number
      timezone: string
    }) => {
      return await saveStepTwo({ city, country, countryCode, lat, lng, timezone })
    },
  })
}

/**
 * Mutation hook for completing onboarding and updating user profile.
 */
export function useCompleteOnboarding() {
  const completeOnboarding = useConvexMutation(api.users.completeOnboarding)

  return useMutation({
    mutationFn: async ({
      interests,
      city,
      country,
      countryCode,
      lat,
      lng,
      timezone,
    }: {
      interests: string[]
      city: string
      country: string
      countryCode: string
      lat: number
      lng: number
      timezone: string
    }) => {
      return await completeOnboarding({
        interests,
        city,
        country,
        countryCode,
        lat,
        lng,
        timezone,
      })
    },
  })
}
