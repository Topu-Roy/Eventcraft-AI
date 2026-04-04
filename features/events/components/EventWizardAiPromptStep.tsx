"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import {
  aiPromptTextAtom,
  setAiGeneratedData,
  setAiWizardStep,
  setIsGenerating,
} from "@/features/events/eventWizard"
import { useAction } from "convex/react"
import { useAtom } from "jotai"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const PROMPT_MIN_LENGTH = 20
const PROMPT_MAX_LENGTH = 400

export function EventWizardAiPromptStep() {
  const [promptText, setPromptText] = useAtom(aiPromptTextAtom)
  const [, dispatchSetGeneratedData] = useAtom(setAiGeneratedData)
  const [, dispatchSetAiStep] = useAtom(setAiWizardStep)
  const [, dispatchSetIsGenerating] = useAtom(setIsGenerating)
  const [isGeneratingState, setIsGeneratingState] = useState(false)

  const generateFromPrompt = useAction(api.events.generateFromPrompt)

  const charCount = promptText.length
  const isPromptValid = charCount >= PROMPT_MIN_LENGTH && charCount <= PROMPT_MAX_LENGTH

  async function handleGenerate() {
    if (!isPromptValid) return

    setIsGeneratingState(true)
    dispatchSetIsGenerating(true)

    try {
      const categorySlugs = [
        "technology",
        "music",
        "art-design",
        "sports",
        "food-drink",
        "business",
        "health-wellness",
        "education",
        "social-community",
        "gaming",
      ]

      const result = await generateFromPrompt({ prompt: promptText, categorySlugs })

      if (result.error) {
        toast.error(result.message ?? "AI generation failed. Please try again.")
        return
      }

      dispatchSetGeneratedData(result.data)
      dispatchSetAiStep("ai-review")
    } catch {
      toast.error("AI generation failed. Please try again.")
    } finally {
      setIsGeneratingState(false)
      dispatchSetIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Sparkles className="mx-auto size-8 text-primary" />
        <h2 className="text-xl font-semibold">Describe Your Event</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your event and AI will generate the details for you.
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="e.g., A weekend tech conference in San Francisco about AI and machine learning with 200 attendees..."
          className="min-h-32"
          value={promptText}
          maxLength={PROMPT_MAX_LENGTH}
          onChange={e => setPromptText(e.target.value)}
        />
        <p className="text-right text-xs text-muted-foreground">
          {charCount < PROMPT_MIN_LENGTH
            ? `At least ${PROMPT_MIN_LENGTH} characters required`
            : `${charCount}/${PROMPT_MAX_LENGTH}`}
        </p>
      </div>

      <Button className="w-full" disabled={!isPromptValid || isGeneratingState} onClick={handleGenerate}>
        {isGeneratingState ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            Generate with AI
          </>
        )}
      </Button>
    </div>
  )
}
