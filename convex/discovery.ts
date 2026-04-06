import { v } from "convex/values"
import { query } from "./_generated/server"

const MAX_STRING_LENGTH = 100
const MAX_LIMIT = 100

function sanitizeString(str: string): string {
  return str.trim().slice(0, MAX_STRING_LENGTH)
}

function validateLimit(limit: number | undefined): number {
  if (!limit || limit < 1) return 20
  return Math.min(limit, MAX_LIMIT)
}

/**
 * Returns personalized events matching the profile's interest categories.
 */
export const getPersonalizedEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const safeLimit = validateLimit(limit)

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { error: true, message: "Not authenticated", cause: "unauthenticated" as const, data: null }
    }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()

    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    if (!profile.interests.length) {
      return { error: true, message: "No interests set", cause: "no_interests" as const, data: [] }
    }

    const now = Date.now()
    const allEvents = await ctx.db.query("events").collect()

    const filtered = allEvents
      .filter(e => e.status === "published" && e.startDatetime >= now && profile.interests.includes(e.category))
      .sort((a, b) => a.startDatetime - b.startDatetime)
      .slice(0, safeLimit)

    return { error: false, message: null, cause: null, data: filtered }
  },
})

/**
 * Returns events in a specific city/country.
 */
export const getEventsByLocation = query({
  args: {
    city: v.string(),
    country: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { city, country, limit = 20 }) => {
    const safeLimit = validateLimit(limit)
    const safeCity = sanitizeString(city)
    const safeCountry = sanitizeString(country)

    const now = Date.now()
    const allEvents = await ctx.db.query("events").collect()

    const filtered = allEvents
      .filter(
        e =>
          e.status === "published" &&
          e.startDatetime >= now &&
          e.venue.city.toLowerCase() === safeCity.toLowerCase() &&
          e.venue.country.toLowerCase() === safeCountry.toLowerCase()
      )
      .sort((a, b) => a.startDatetime - b.startDatetime)
      .slice(0, safeLimit)

    return { error: false, message: null, cause: null, data: filtered }
  },
})

/**
 * Returns events filtered by category.
 */
export const getEventsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 20 }) => {
    const safeLimit = validateLimit(limit)
    const safeCategory = sanitizeString(category)

    const now = Date.now()

    const events = await ctx.db
      .query("events")
      .withIndex("by_category_status_date", q => q.eq("category", safeCategory).eq("status", "published"))
      .filter(q => q.gte(q.field("startDatetime"), now))
      .take(safeLimit)

    return { error: false, message: null, cause: null, data: events }
  },
})

/**
 * Returns trending events (most registrations in the past 7 days).
 */
export const getTrendingEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const safeLimit = validateLimit(limit)
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    const analytics = await ctx.db.query("eventAnalytics").collect()
    const trending = analytics
      .filter(a => {
        const dailyCounts = a.dailyCounts as Record<string, number>
        return Object.entries(dailyCounts).some(([date, count]) => {
          const dateMs = new Date(date).getTime()
          return dateMs >= sevenDaysAgo && count > 0
        })
      })
      .sort((a, b) => b.totalRegistrations - a.totalRegistrations)
      .slice(0, safeLimit)

    const eventIds = trending.map(a => a.eventId)
    const events = await Promise.all(eventIds.map(id => ctx.db.get("events", id)))

    const filtered = events.filter(
      (e): e is NonNullable<typeof e> => e !== null && e.status === "published" && e.startDatetime >= now
    )

    return { error: false, message: null, cause: null, data: filtered }
  },
})

/**
 * Returns a single published event by ID for the detail page.
 */
export const getEventDetail = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get("events", eventId)
    if (!event) {
      return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }
    }

    const identity = await ctx.auth.getUserIdentity()
    let profile = null
    if (identity) {
      profile = await ctx.db
        .query("profile")
        .withIndex("by_userId", q => q.eq("userId", identity.subject))
        .first()
    }

    const isOrganizer = profile
      ? event.organizerId === profile._id || event.coOrganizers.includes(profile._id)
      : false

    if (event.status !== "published" && !isOrganizer) {
      return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }
    }

    const organizer = await ctx.db.get("profile", event.organizerId)

    let isRegistered = false
    if (profile) {
      const registration = await ctx.db
        .query("registrations")
        .withIndex("by_profileId_event", q => q.eq("profileId", profile._id).eq("eventId", eventId))
        .first()
      isRegistered = registration?.status === "active"
    }

    return {
      error: false,
      message: null,
      cause: null,
      data: { event, organizer, isOrganizer, isRegistered },
    }
  },
})

/**
 * Global search across events using Convex search index.
 */
export const searchEvents = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query: searchQuery, limit = 20 }) => {
    const safeLimit = validateLimit(limit)
    const safeQuery = sanitizeString(searchQuery)

    if (!safeQuery) {
      return { error: false, message: null, cause: null, data: [] }
    }

    const events = await ctx.db
      .query("events")
      .withSearchIndex("search_events", q => q.search("searchableText", safeQuery).eq("status", "published"))
      .take(safeLimit)

    return { error: false, message: null, cause: null, data: events }
  },
})
