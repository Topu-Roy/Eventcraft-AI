import type { Doc } from "@/convex/_generated/dataModel"

export type OnboardingStep = 1 | 2 | 3

export type StepOneData = {
  interests: string[]
}

export type StepTwoData = {
  city: string
  country: string
  countryCode: string
  lat: number
  lng: number
  timezone: string
}

export type OnboardingDocument = Doc<"onboarding">
