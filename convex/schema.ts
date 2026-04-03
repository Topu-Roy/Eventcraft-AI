import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const tables = {
  users: defineTable({
    authId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("attendee"), v.literal("organizer"), v.literal("both")),
    plan: v.union(v.literal("free"), v.literal("pro")),
    interests: v.array(v.string()),
    location: v.optional(
      v.object({
        city: v.string(),
        country: v.string(),
        countryCode: v.string(),
        lat: v.number(),
        lng: v.number(),
      })
    ),
    timezone: v.optional(v.string()),
    onboardingComplete: v.boolean(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_email", ["email"]),

  events: defineTable({
    organizerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverPhoto: v.optional(
      v.object({
        url: v.string(),
        dominantColor: v.string(),
        photographerName: v.string(),
        photographerUrl: v.string(),
      })
    ),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("completed"), v.literal("cancelled")),
    venue: v.object({
      name: v.string(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lng: v.number(),
    }),
    startDatetime: v.number(),
    endDatetime: v.number(),
    capacity: v.union(v.null(), v.number()),
    registrationCount: v.number(),
    isFeatured: v.boolean(),
    theme: v.optional(
      v.object({
        accentColor: v.string(),
        layoutVariant: v.union(v.literal("default"), v.literal("minimal"), v.literal("bold")),
      })
    ),
    coOrganizers: v.array(v.id("users")),
    searchableText: v.string(),
  })
    .index("by_category_status_date", ["category", "status", "startDatetime"])
    .index("by_location_status", ["venue.city", "venue.country", "status"])
    .index("by_organizer", ["organizerId"])
    .searchIndex("search_events", {
      searchField: "searchableText",
      filterFields: ["status"],
    }),

  registrations: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    ticketCode: v.string(),
    status: v.union(v.literal("active"), v.literal("cancelled")),
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.union(v.null(), v.number())),
    cancelledAt: v.optional(v.union(v.null(), v.number())),
  })
    .index("by_user", ["userId", "status"])
    .index("by_event", ["eventId", "status"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_ticket_code", ["ticketCode"]),

  eventAnalytics: defineTable({
    eventId: v.id("events"),
    dailyCounts: v.any(),
    totalRegistrations: v.number(),
    totalCheckedIn: v.number(),
  }).index("by_event", ["eventId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    iconName: v.string(),
    colorToken: v.string(),
  }).index("by_slug", ["slug"]),

  onboarding: defineTable({
    userId: v.id("users"),
    completedSteps: v.array(v.number()),
    stepOneData: v.object({
      interests: v.array(v.string()),
    }),
    stepTwoData: v.object({
      city: v.string(),
      country: v.string(),
      countryCode: v.string(),
      lat: v.number(),
      lng: v.number(),
      timezone: v.string(),
    }),
  }).index("by_user", ["userId"]),
}

const schema = defineSchema(tables)

export default schema
