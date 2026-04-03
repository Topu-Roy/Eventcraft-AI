import { z } from "zod"

export const eventDetailsSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()),
  startDatetime: z.string().min(1, "Start date is required"),
  endDatetime: z.string().min(1, "End date is required"),
  capacity: z.union([z.number().int().positive(), z.null()]),
})

export type EventDetailsFormData = z.infer<typeof eventDetailsSchema>

export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  lat: z.number(),
  lng: z.number(),
})

export type VenueFormData = z.infer<typeof venueSchema>
