"use client"

import { useState } from "react"
import { useAtomValue } from "jotai"
import { ArrowLeft, ArrowRight, Rocket, Save } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { selectedPipelineAtom } from "../eventWizard"

type EventWizardNavigationProps = {
  currentStepIndex: number
  totalSteps: number
  isSubmitting: boolean
  isSaving: boolean
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  onPublish: () => void
  onBackToLanding: () => void
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
  onBackToLanding,
}: EventWizardNavigationProps) {
  const selectedMethod = useAtomValue(selectedPipelineAtom)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const isLastStep = currentStepIndex === totalSteps - 1
  const isFirstStep = currentStepIndex === 0

  function handleBackClick() {
    if (isFirstStep) {
      setShowConfirmDialog(true)
    } else {
      onBack()
    }
  }

  function handleConfirmBack() {
    setShowConfirmDialog(false)
    onBackToLanding()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackClick} disabled={isSubmitting || isSaving}>
            <ArrowLeft className="mr-1 size-4" />
            {selectedMethod === "ai" ? "Manual Mode" : "AI Mode"}
          </Button>
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Go back to selection?</AlertDialogTitle>
            <AlertDialogDescription>
              Going back will lose your progress in this wizard. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBack}>Go back</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
