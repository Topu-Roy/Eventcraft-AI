import type { Doc } from "@/convex/_generated/dataModel"

export type EventFormData = {
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
  startDatetime: number
  endDatetime: number
  capacity: number | null
  coverPhoto: {
    url: string
    dominantColor: string
    photographerName: string
    photographerUrl: string
  }
}

export type EventStep = 1 | 2 | 3 | 4

export const DEFAULT_EVENT_FORM: EventFormData = {
  title: "",
  description: "",
  category: "",
  tags: [],
  venue: {
    name: "",
    address: "",
    city: "",
    country: "",
    lat: 0,
    lng: 0,
  },
  startDatetime: 0,
  endDatetime: 0,
  capacity: null,
  coverPhoto: {
    url: "",
    dominantColor: "",
    photographerName: "",
    photographerUrl: "",
  },
}

export type EventDocument = Doc<"events">
