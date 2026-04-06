import { number, object, optional, string } from "zod/v4"

export const eventEditSchema = object({
  title: string().min(3, "Title must be at least 3 characters").max(200),
  description: string().min(10, "Description must be at least 10 characters").max(5000),
  category: string().min(1, "Category is required"),
  tags: string().array().max(20),
  venue: object({
    name: string().min(1, "Venue name is required"),
    address: string().min(1, "Address is required"),
    city: string().min(1, "City is required"),
    country: string().min(1, "Country is required"),
    lat: number(),
    lng: number(),
  }),
  startDatetime: string().min(1, "Start date is required"),
  endDatetime: string().min(1, "End date is required"),
  capacity: optional(number().min(1, "Capacity must be at least 1")),
})

export type EventEditInput = typeof eventEditSchema._output
