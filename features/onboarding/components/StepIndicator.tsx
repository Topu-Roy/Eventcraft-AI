import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type StepIndicatorProps = {
  currentStep: number
  completedSteps: number[]
  totalSteps: number
}

export function StepIndicator({ currentStep, completedSteps, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => {
        const isCompleted = completedSteps.includes(step)
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex items-center gap-1 sm:gap-2">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors sm:h-10 sm:w-10",
                isCompleted && "border-primary bg-primary text-primary-foreground",
                isCurrent && !isCompleted && "border-primary text-primary",
                !isCompleted && !isCurrent && "border-muted-foreground/20 text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={cn(
                  "h-0.5 w-6 transition-colors sm:w-8",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
