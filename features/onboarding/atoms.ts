import type { OnboardingStep, StepOneData, StepTwoData } from "@/features/onboarding/types"
import { atom } from "jotai"

export const currentStepAtom = atom<OnboardingStep>(1)

export const stepOneDataAtom = atom<StepOneData>({ interests: [] })

export const stepTwoDataAtom = atom<StepTwoData>({
  city: "",
  country: "",
  countryCode: "",
  lat: 0,
  lng: 0,
  timezone: "",
})

export const isSubmittingAtom = atom(false)
