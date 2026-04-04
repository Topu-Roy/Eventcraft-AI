"use client"

import { setAiWizardStep, setManualWizardStep, setSelectedPipeline } from "@/features/events/eventWizard"
import { useAtom } from "jotai"
import { ArrowRight, Pencil, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type EventWizardLandingProps = Record<string, never>

export function EventWizardLanding(_props: EventWizardLandingProps) {
  const [, dispatchSetPipeline] = useAtom(setSelectedPipeline)
  const [, dispatchSetAiStep] = useAtom(setAiWizardStep)
  const [, dispatchSetManualStep] = useAtom(setManualWizardStep)

  function handleSelect(pipeline: "ai" | "manual") {
    dispatchSetPipeline(pipeline)
    if (pipeline === "ai") {
      dispatchSetAiStep("ai-prompt")
    } else {
      dispatchSetManualStep("details")
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card
        className="group flex cursor-pointer flex-col items-center gap-4 p-8 text-center transition-all hover:border-primary/50 hover:shadow-sm"
        onClick={() => handleSelect("ai")}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleSelect("ai")
          }
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Sparkles className="size-7 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Create with AI</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Describe your event in natural language and let AI set it up for you.
          </p>
        </div>
        <Button className="w-full">
          Create with AI
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </Card>

      <Card
        className="group flex cursor-pointer flex-col items-center gap-4 p-8 text-center transition-all hover:border-primary/50 hover:shadow-sm"
        onClick={() => handleSelect("manual")}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleSelect("manual")
          }
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Pencil className="size-7 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Create Manually</h3>
          <p className="mt-2 text-sm text-muted-foreground">Fill in all the details yourself step by step.</p>
        </div>
        <Button variant="outline" className="w-full">
          Create Manually
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </Card>
    </div>
  )
}
