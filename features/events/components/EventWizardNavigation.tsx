"use client"

import { ArrowLeft, ArrowRight, Rocket, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

type EventWizardNavigationProps = {
  currentStepIndex: number
  totalSteps: number
  isSubmitting: boolean
  isSaving: boolean
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  onPublish: () => void
}

export function EventWizardNavigation({
  currentStepIndex,
  totalSteps,
  isSubmitting,
  isSaving,
  onBack,
  onNext,
  onSaveDraft,
  onPublish,
}: EventWizardNavigationProps) {
  const isLastStep = currentStepIndex === totalSteps - 1

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {currentStepIndex > 0 ? (
          <Button variant="outline" onClick={onBack} disabled={isSubmitting || isSaving}>
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Button>
        ) : null}
        <Button variant="outline" onClick={onSaveDraft} disabled={isSubmitting || isSaving}>
          <Save className="mr-1 size-4" />
          Save Draft
        </Button>
      </div>

      {isLastStep ? (
        <Button onClick={onPublish} disabled={isSubmitting || isSaving}>
          <Rocket className="mr-1 size-4" />
          {isSubmitting ? "Publishing..." : "Publish Event"}
        </Button>
      ) : (
        <Button onClick={onNext} disabled={isSubmitting || isSaving}>
          Next
          <ArrowRight className="ml-1 size-4" />
        </Button>
      )}
    </div>
  )
}
