"use client"

import { useEffect, useRef } from "react"
import { currentStepAtom, stepOneDataAtom, stepTwoDataAtom } from "@/features/onboarding/atoms"
import { StepIndicator } from "@/features/onboarding/components/StepIndicator"
import { StepOneInterests } from "@/features/onboarding/components/StepOneInterests"
import { StepThreeWelcome } from "@/features/onboarding/components/StepThreeWelcome"
import { StepTwoLocation } from "@/features/onboarding/components/StepTwoLocation"
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding"
import { useSaveStepOne, useSaveStepTwo } from "@/features/onboarding/hooks/useOnboardingMutations"
import type { OnboardingStep } from "@/features/onboarding/types"
import { useAtom } from "jotai"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Skeleton } from "@/components/ui/skeleton"

type OnboardingWizardProps = Record<string, never>

export function OnboardingWizard(_props: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom)
  const [stepOneData, setStepOneData] = useAtom(stepOneDataAtom)
  const [stepTwoData, setStepTwoData] = useAtom(stepTwoDataAtom)

  const onboardingData = useOnboarding()
  const saveStepOne = useSaveStepOne()
  const saveStepTwo = useSaveStepTwo()

  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (onboardingData === undefined || isInitializedRef.current) return

    isInitializedRef.current = true
    const completedSteps = onboardingData?.completedSteps ?? []

    if (completedSteps.includes(1) && onboardingData?.stepOneData) {
      setStepOneData(onboardingData.stepOneData)
    }

    if (completedSteps.includes(2) && onboardingData?.stepTwoData) {
      setStepTwoData(onboardingData.stepTwoData)
    }

    const firstIncompleteStep = !completedSteps.includes(1) ? 1 : !completedSteps.includes(2) ? 2 : 3
    setCurrentStep(firstIncompleteStep as OnboardingStep)
  }, [onboardingData, setCurrentStep, setStepOneData, setStepTwoData])

  function handleStepOneNext() {
    void saveStepOneAndAdvance()
  }

  async function saveStepOneAndAdvance() {
    const result = await tryCatch(() => saveStepOne.mutateAsync({ interests: stepOneData.interests }))
    if (result.error) {
      toast.error("Failed to save your interests. Please try again.")
      return
    }
    setCurrentStep(2)
  }

  function handleStepTwoNext() {
    void saveStepTwoAndAdvance()
  }

  async function saveStepTwoAndAdvance() {
    const result = await tryCatch(() =>
      saveStepTwo.mutateAsync({
        city: stepTwoData.city,
        country: stepTwoData.country,
        countryCode: stepTwoData.countryCode,
        lat: stepTwoData.lat,
        lng: stepTwoData.lng,
        timezone: stepTwoData.timezone,
      })
    )
    if (result.error) {
      toast.error("Failed to save your location. Please try again.")
      return
    }
    setCurrentStep(3)
  }

  if (onboardingData === undefined) {
    return <OnboardingWizardSkeleton />
  }

  const completedSteps = onboardingData?.completedSteps ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} totalSteps={3} />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {currentStep === 1 ? <StepOneInterests onNext={handleStepOneNext} /> : null}
        {currentStep === 2 ? <StepTwoLocation onNext={handleStepTwoNext} /> : null}
        {currentStep === 3 ? <StepThreeWelcome /> : null}
      </div>
    </div>
  )
}

function OnboardingWizardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
