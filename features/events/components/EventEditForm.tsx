"use client"

import { useCallback } from "react"
import { useForm } from "@tanstack/react-form"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { eventEditSchema, type EventEditInput } from "@/features/events/schemas"
import { eventToFormData } from "@/features/events/types"
import type { EditableFields } from "@/features/events/types"
import { useMutation, useQuery } from "convex/react"
import { Calendar, ImageIcon, MapPin, Save, X } from "lucide-react"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { CoverImage } from "@/components/CoverImage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type EventEditFormProps = {
  eventId: Id<"events">
  event: Doc<"events">
}

function getDefaultValues(eventData: EditableFields): EventEditInput {
  return {
    title: eventData.title,
    description: eventData.description,
    category: eventData.category,
    tags: eventData.tags,
    venue: eventData.venue,
    startDatetime: eventData.startDatetime,
    endDatetime: eventData.endDatetime,
    capacity: eventData.capacity,
  }
}

export function EventEditForm({ eventId, event }: EventEditFormProps) {
  const categories = useQuery(api.categories.list)
  const updateEvent = useMutation(api.events.update)

  const form = useForm({
    defaultValues: getDefaultValues(eventToFormData(event)),
    validators: {
      onChange: eventEditSchema,
    },
    onSubmit: async ({ value }) => {
      const startMs = value.startDatetime ? new Date(value.startDatetime).getTime() : 0
      const endMs = value.endDatetime ? new Date(value.endDatetime).getTime() : startMs + 3600000

      const result = await tryCatch(
        updateEvent({
          eventId,
          title: value.title,
          description: value.description,
          category: value.category,
          tags: value.tags,
          venue: value.venue,
          startDatetime: startMs,
          endDatetime: endMs,
          capacity: value.capacity,
          coverPhoto: event.coverPhoto ?? undefined,
        })
      )

      if (result.error) {
        toast.error(result.error.message)
      } else if (result.data?.error) {
        toast.error(result.data.cause)
      } else {
        toast.success("Event saved")
      }
    },
  })

  const addTag = useCallback(() => {
    const tags = form.getFieldValue("tags")
    form.setFieldValue("tags", [...tags, ""])
  }, [form])

  const updateTag = useCallback(
    (index: number, value: string) => {
      const tags = form.getFieldValue("tags")
      const newTags = [...tags]
      newTags[index] = value
      form.setFieldValue("tags", newTags)
    },
    [form]
  )

  const removeTag = useCallback(
    (index: number) => {
      const tags = form.getFieldValue("tags")
      form.setFieldValue(
        "tags",
        tags.filter((_, i) => i !== index)
      )
    },
    [form]
  )

  return (
    <form
      id="edit-event-form"
      onSubmit={e => {
        e.preventDefault()
        void form.handleSubmit()
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Event Details
          </CardTitle>
          <CardDescription>Basic information about your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="title">
              {field => {
                const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="description">
              {field => {
                const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                      className="min-h-24"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="category">
              {field => {
                const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                    <Select value={field.state.value} onValueChange={v => field.handleChange(v)}>
                      <SelectTrigger id={field.name}>
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
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="tags">
              {field => (
                <Field>
                  <FieldLabel>Tags</FieldLabel>
                  <div className="space-y-2">
                    {field.state.value.map((tag, index) => (
                      <div key={index} className="flex gap-2">
                        <Input placeholder="Tag..." value={tag} onChange={e => updateTag(index, e.target.value)} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeTag(index)}
                          aria-label={`Remove tag ${tag || index + 1}`}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>
                      Add Tag
                    </Button>
                  </div>
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Cover Photo
          </CardTitle>
          <CardDescription>Current event cover photo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video overflow-hidden rounded-lg border">
            <CoverImage
              storageId={event.coverPhoto}
              alt={event.title}
              className="h-full w-full"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Cover photo editing coming soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Venue & Schedule
          </CardTitle>
          <CardDescription>Where and when your event takes place.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="venue">
              {field => (
                <>
                  <Field>
                    <FieldLabel htmlFor="venue-name">Venue Name</FieldLabel>
                    <Input
                      id="venue-name"
                      value={field.state.value.name}
                      onChange={e => field.handleChange({ ...field.state.value, name: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="venue-address">Address</FieldLabel>
                    <Input
                      id="venue-address"
                      value={field.state.value.address}
                      onChange={e => field.handleChange({ ...field.state.value, address: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="venue-city">City</FieldLabel>
                      <Input
                        id="venue-city"
                        value={field.state.value.city}
                        onChange={e => field.handleChange({ ...field.state.value, city: e.target.value })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="venue-country">Country</FieldLabel>
                      <Input
                        id="venue-country"
                        value={field.state.value.country}
                        onChange={e =>
                          field.handleChange({
                            ...field.state.value,
                            country: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                </>
              )}
            </form.Field>

            <form.Field name="startDatetime">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Start Date & Time</FieldLabel>
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="endDatetime">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>End Date & Time</FieldLabel>
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="capacity">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Capacity</FieldLabel>
                  <FieldDescription>Leave empty for unlimited capacity.</FieldDescription>
                  <Input
                    id={field.name}
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={field.state.value ?? ""}
                    onChange={e => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" form="edit-event-form">
          <Save className="mr-1 size-4" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}
