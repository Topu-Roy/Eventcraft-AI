"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { updateWizardData, wizardDataAtom } from "@/features/events/eventWizard"
import { useQuery } from "convex/react"
import { useAtom } from "jotai"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function EventWizardDetailsStep() {
  const wizardData = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdateWizardData] = useAtom(updateWizardData)
  const categories = useQuery(api.categories.list)
  const [tagInputText, setTagInputText] = useState("")

  function handleAddTag() {
    const trimmedTag = tagInputText.trim()
    if (trimmedTag && !wizardData.tags.includes(trimmedTag)) {
      dispatchUpdateWizardData({ tags: [...wizardData.tags, trimmedTag] })
      setTagInputText("")
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    dispatchUpdateWizardData({ tags: wizardData.tags.filter(tag => tag !== tagToRemove) })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="event-title">Event Title</Label>
        <Input
          id="event-title"
          placeholder="e.g., TechConf 2026"
          value={wizardData.title}
          onChange={e => dispatchUpdateWizardData({ title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          placeholder="Describe your event..."
          className="min-h-24"
          value={wizardData.description}
          onChange={e => dispatchUpdateWizardData({ description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="event-category">Category</Label>
        <Select
          value={wizardData.category || undefined}
          onValueChange={selectedValue => dispatchUpdateWizardData({ category: selectedValue })}
        >
          <SelectTrigger id="event-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map(category => (
              <SelectItem key={category._id} value={category.slug}>
                {category.name}
              </SelectItem>
            )) ?? null}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInputText}
            onChange={e => setTagInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {wizardData.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {wizardData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
