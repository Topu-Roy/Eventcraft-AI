"use client"

import { isSubmittingAtom, stepOneDataAtom, stepTwoDataAtom } from "@/features/onboarding/atoms"
import { useCompleteOnboarding } from "@/features/onboarding/hooks/useOnboardingMutations"
import { useAtom } from "jotai"
import { Loader2, PartyPopper } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Button } from "@/components/ui/button"

export function StepThreeWelcome() {
  const router = useRouter()
  const [stepOneData] = useAtom(stepOneDataAtom)
  const [stepTwoData] = useAtom(stepTwoDataAtom)
  const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom)

  const completeOnboarding = useCompleteOnboarding()

  async function handleComplete() {
    if (isSubmitting) return
    setIsSubmitting(true)

    const result = await tryCatch(() =>
      completeOnboarding.mutateAsync({
        interests: stepOneData.interests,
        city: stepTwoData.city,
        country: stepTwoData.country,
        countryCode: stepTwoData.countryCode,
        lat: stepTwoData.lat,
        lng: stepTwoData.lng,
        timezone: stepTwoData.timezone,
      })
    )

    if (result.error) {
      toast.error("Something went wrong. Please try again.")
      setIsSubmitting(false)
      return
    }

    toast.success("You're all set!")
    router.push("/explore")
  }

  return (
    <div className="flex flex-col items-center space-y-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <PartyPopper className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">You&apos;re all set!</h2>
        <p className="text-muted-foreground">
          We&apos;ve personalized your experience based on your interests and location. Let&apos;s discover some
          amazing events.
        </p>
      </div>

      <div className="rounded-md border bg-accent p-4 text-sm">
        <p className="font-medium">Your interests:</p>
        <p className="text-muted-foreground">{stepOneData.interests.length} categories selected</p>
        <p className="mt-1 font-medium">Your location:</p>
        <p className="text-muted-foreground">
          {stepTwoData.city}, {stepTwoData.country}
        </p>
      </div>

      <Button onClick={handleComplete} disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up...
          </>
        ) : (
          "Explore Events"
        )}
      </Button>
    </div>
  )
}
