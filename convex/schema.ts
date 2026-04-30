import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const tables = {
  profile: defineTable({
    userId: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
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
  }).index("by_userId", ["userId"]),

  events: defineTable({
    organizerId: v.id("profile"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    coverPhoto: v.optional(v.id("_storage")),
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
    capacity: v.optional(v.number()),
    registrationCount: v.number(),
    isFeatured: v.boolean(),
    coOrganizers: v.array(v.id("profile")),
    searchableText: v.string(),
    isSeed: v.boolean(),
  })
    .index("by_category_status_date", ["category", "status", "startDatetime"])
    .index("by_location_status", ["venue.city", "venue.country", "status"])
    .index("by_organizer", ["organizerId"])
    .index("by_isSeed", ["isSeed"])
    .searchIndex("search_events", {
      searchField: "searchableText",
      filterFields: ["status"],
    }),

  registrations: defineTable({
    profileId: v.id("profile"),
    eventId: v.id("events"),
    ticketCode: v.string(),
    status: v.union(v.literal("active"), v.literal("cancelled")),
    checkInStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_profileId_status", ["profileId", "status"])
    .index("by_eventId_status", ["eventId", "status"])
    .index("by_profileId_event", ["profileId", "eventId"])
    .index("by_ticket_code", ["ticketCode"]),

  eventAnalytics: defineTable({
    eventId: v.id("events"),
    dailyCounts: v.record(v.string(), v.number()),
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
    profileId: v.id("profile"),
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
  }).index("profileId", ["profileId"]),
}

const schema = defineSchema(tables)

export default schema
