import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard"

export const metadata = {
  title: "Get Started — EventCraft AI",
  description: "Set up your preferences to discover events tailored to you.",
}

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <OnboardingWizard />
    </div>
  )
}
