"use client"

import type { WizardStep } from "@/features/events/eventWizard"
import { Progress } from "@/components/ui/progress"

type StepDef = { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }

type EventWizardStepIndicatorProps = {
  currentStep: WizardStep
  steps: StepDef[]
}

export function EventWizardStepIndicator({ currentStep, steps }: EventWizardStepIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCurrentStep = step.key === currentStep
          const isCompletedStep = index < currentStepIndex
          const StepIcon = step.icon

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompletedStep
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                }`}
              >
                <StepIcon className="size-4" />
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrentStep ? "text-foreground" : isCompletedStep ? "text-primary" : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <Progress value={progressPercentage} className="h-1" />
    </div>
  )
}
