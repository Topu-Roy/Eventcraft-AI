"use client"

import { currentStepAtom, stepOneDataAtom, stepTwoDataAtom } from "@/features/onboarding/atoms"
import { StepIndicator } from "@/features/onboarding/components/StepIndicator"
import { StepOneInterests } from "@/features/onboarding/components/StepOneInterests"
import { StepThreeWelcome } from "@/features/onboarding/components/StepThreeWelcome"
import { StepTwoLocation } from "@/features/onboarding/components/StepTwoLocation"
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding"
import { useSaveStepOne, useSaveStepTwo } from "@/features/onboarding/hooks/useOnboardingMutations"
import { useAtom } from "jotai"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Skeleton } from "@/components/ui/skeleton"

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom)
  const [stepOneData] = useAtom(stepOneDataAtom)
  const [stepTwoData] = useAtom(stepTwoDataAtom)
  const setStepOneData = useAtom(stepOneDataAtom)[1]
  const setStepTwoData = useAtom(stepTwoDataAtom)[1]

  const onboardingData = useOnboarding()
  const saveStepOne = useSaveStepOne()
  const saveStepTwo = useSaveStepTwo()

  if (onboardingData === undefined) {
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

  const completedSteps = onboardingData?.completedSteps ?? []

  if (completedSteps.length > 0 && !onboardingData?._id) {
    return null
  }

  const isFirstLoad = completedSteps.length > 0 && stepOneData.interests.length === 0 && stepTwoData.city === ""

  if (isFirstLoad && onboardingData) {
    if (completedSteps.includes(1) && onboardingData.stepOneData) {
      setStepOneData(onboardingData.stepOneData)
    }

    if (completedSteps.includes(2) && onboardingData.stepTwoData) {
      setStepTwoData(onboardingData.stepTwoData)
    }

    const firstIncomplete = !completedSteps.includes(1) ? 1 : !completedSteps.includes(2) ? 2 : 3
    setCurrentStep(firstIncomplete)
  }

  async function handleStepOneNext() {
    const result = await tryCatch(() => saveStepOne.mutateAsync({ interests: stepOneData.interests }))
    if (result.error) {
      toast.error("Failed to save your interests. Please try again.")
      return
    }
    setCurrentStep(2)
  }

  async function handleStepTwoNext() {
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} totalSteps={3} />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {currentStep === 1 && <StepOneInterests onNext={handleStepOneNext} />}
        {currentStep === 2 && <StepTwoLocation onNext={handleStepTwoNext} />}
        {currentStep === 3 && <StepThreeWelcome />}
      </div>
    </div>
  )
}
