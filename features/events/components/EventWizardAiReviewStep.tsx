"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import {
  aiGeneratedDataAtom,
  aiModificationTextAtom,
  setAiGeneratedData,
  setAiWizardStep,
  updateWizardData,
} from "@/features/events/eventWizard"
import { useAction } from "convex/react"
import { useAtom } from "jotai"
import { ArrowRight, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function EventWizardAiReviewStep() {
  const [generatedData] = useAtom(aiGeneratedDataAtom)
  const [modificationText, setModificationText] = useAtom(aiModificationTextAtom)
  const [isModifying, setIsModifying] = useState(false)
  const [, dispatchSetAiStep] = useAtom(setAiWizardStep)
  const [, dispatchUpdateWizardData] = useAtom(updateWizardData)
  const [, dispatchSetGeneratedData] = useAtom(setAiGeneratedData)

  const modifyEventData = useAction(api.events.modifyEventData)

  const [editableTitle, setEditableTitle] = useState(generatedData?.title ?? "")
  const [editableDescription, setEditableDescription] = useState(generatedData?.description ?? "")
  const [editableCategory, setEditableCategory] = useState(generatedData?.category ?? "")
  const [editableTags, setEditableTags] = useState<string[]>(generatedData?.tags ?? [])

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

  function handleApplyChanges() {
    if (!editableTitle || !editableDescription || !editableCategory) {
      toast.error("Title, description, and category are required.")
      return
    }

    dispatchSetGeneratedData({
      title: editableTitle,
      description: editableDescription,
      category: editableCategory,
      tags: editableTags,
    })
    dispatchUpdateWizardData({
      title: editableTitle,
      description: editableDescription,
      category: editableCategory,
      tags: editableTags,
    })
    dispatchSetAiStep("cover-photo")
  }

  async function handleReroll() {
    if (!generatedData || !modificationText.trim()) {
      toast.error("Please tell the AI what to change.")
      return
    }

    setIsModifying(true)
    try {
      const result = await modifyEventData({
        previousData: {
          title: editableTitle,
          description: editableDescription,
          category: editableCategory,
          tags: editableTags,
        },
        modification: modificationText.trim(),
        categorySlugs,
      })

      if (result.error || !result.data) {
        toast.error(result.message ?? "Modification failed. Please try again.")
        return
      }

      setEditableTitle(result.data.title)
      setEditableDescription(result.data.description)
      setEditableCategory(result.data.category)
      setEditableTags(result.data.tags)
      dispatchSetGeneratedData(result.data)
      setModificationText("")
      toast.success("Event data updated!")
    } catch {
      toast.error("Modification failed. Please try again.")
    } finally {
      setIsModifying(false)
    }
  }

  if (!generatedData) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Sparkles className="mx-auto size-8 text-primary" />
        <h2 className="text-xl font-semibold">AI Generated Your Event</h2>
        <p className="text-sm text-muted-foreground">
          Review and edit the details below. You can modify individual fields or tell AI what to change.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="review-title">Title</Label>
          <Input id="review-title" value={editableTitle} onChange={e => setEditableTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-description">Description</Label>
          <Textarea
            id="review-description"
            value={editableDescription}
            onChange={e => setEditableDescription(e.target.value)}
            className="min-h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-category">Category</Label>
          <Select value={editableCategory} onValueChange={setEditableCategory}>
            <SelectTrigger id="review-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categorySlugs.map(slug => (
                <SelectItem key={slug} value={slug}>
                  {slug.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {editableTags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border bg-accent p-4">
        <Label htmlFor="modification-input">Tell AI what to change</Label>
        <div className="flex gap-2">
          <Input
            id="modification-input"
            placeholder="e.g., Make the title shorter, add more technical topics..."
            value={modificationText}
            onChange={e => setModificationText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !isModifying) {
                e.preventDefault()
                void handleReroll()
              }
            }}
          />
          <Button onClick={handleReroll} disabled={isModifying || !modificationText.trim()}>
            {isModifying ? (
              <>
                <Loader2 className="mr-1 size-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-1 size-4" />
                Apply
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">Generated by AI — all fields are editable.</p>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => dispatchSetAiStep("ai-prompt")}>
          Back to Prompt
        </Button>
        <Button className="flex-1" onClick={handleApplyChanges}>
          Continue
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
