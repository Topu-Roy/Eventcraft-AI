import type { Doc } from "@/convex/_generated/dataModel"

export type EditableFields = {
  title: string
  description: string
  category: string
  tags: string[]
  venue: {
    name: string
    address: string
    city: string
    country: string
    lat: number
    lng: number
  }
  startDatetime: string
  endDatetime: string
  capacity: number | undefined
  coverPhoto: Doc<"events">["coverPhoto"]
}

/**
 * Converts a Convex event document into editable form fields.
 * Datetime fields are converted to ISO string slices for datetime-local inputs.
 */
export function eventToFormData(event: Doc<"events">): EditableFields {
  return {
    title: event.title,
    description: event.description,
    category: event.category,
    tags: event.tags,
    venue: {
      name: event.venue.name,
      address: event.venue.address,
      city: event.venue.city,
      country: event.venue.country,
      lat: event.venue.lat,
      lng: event.venue.lng,
    },
    startDatetime: event.startDatetime ? new Date(event.startDatetime).toISOString().slice(0, 16) : "",
    endDatetime: event.endDatetime ? new Date(event.endDatetime).toISOString().slice(0, 16) : "",
    capacity: event.capacity,
    coverPhoto: event.coverPhoto,
  }
}
