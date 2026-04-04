"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function EventWizardAiPromptStep() {
  const [aiPromptText, setAiPromptText] = useState("")

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Sparkles className="mx-auto size-8 text-primary" />
        <h2 className="text-xl font-semibold">Describe your event</h2>
        <p className="text-sm text-muted-foreground">Tell us about your event and AI will help you set it up.</p>
      </div>
      <Textarea
        placeholder="e.g., A weekend tech conference in San Francisco about AI and machine learning with 200 attendees..."
        className="min-h-32"
        value={aiPromptText}
        onChange={e => setAiPromptText(e.target.value)}
      />
      <p className="text-center text-xs text-muted-foreground">
        AI-powered event creation coming soon. For now, continue to fill in details manually.
      </p>
    </div>
  )
}
