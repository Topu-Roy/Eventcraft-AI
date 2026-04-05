"use client"

import { useCallback } from "react"
import type { Doc } from "@/convex/_generated/dataModel"
import type { EditableFields } from "@/features/events/types"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type EventDetailsFormProps = {
  formData: EditableFields
  categories: Doc<"categories">[] | undefined
  tagInput: string
  onTagInputChange: (value: string) => void
  onFieldChange: <K extends keyof EditableFields>(field: K, value: EditableFields[K]) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
}

export function EventDetailsForm({
  formData,
  categories,
  tagInput,
  onTagInputChange,
  onFieldChange,
  onAddTag,
  onRemoveTag,
}: EventDetailsFormProps) {
  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        onAddTag()
      }
    },
    [onAddTag]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          Event Details
        </CardTitle>
        <CardDescription>Basic information about your event.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="edit-title">Title</Label>
          <Input id="edit-title" value={formData.title} onChange={e => onFieldChange("title", e.target.value)} />
        </div>

        <div>
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={e => onFieldChange("description", e.target.value)}
            className="min-h-24"
          />
        </div>

        <div>
          <Label htmlFor="edit-category">Category</Label>
          <Select value={formData.category} onValueChange={v => onFieldChange("category", v)}>
            <SelectTrigger id="edit-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map(cat => (
                <SelectItem key={cat._id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tags</Label>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={e => onTagInputChange(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Button type="button" variant="secondary" onClick={onAddTag}>
              Add
            </Button>
          </div>
          {formData.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => onRemoveTag(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
