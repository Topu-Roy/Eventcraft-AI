import { v } from "convex/values"
import { query } from "./_generated/server"

/**
 * Returns personalized events matching the user's interest categories.
 * Sorted by startDatetime ascending. Used for the personalized carousel.
 */
export const getPersonalizedEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user?.interests.length) return []

    const now = Date.now()
    const allEvents = await ctx.db.query("events").collect()

    return allEvents
      .filter(e => e.status === "published" && e.startDatetime >= now && user.interests.includes(e.category))
      .sort((a, b) => a.startDatetime - b.startDatetime)
      .slice(0, limit)
  },
})

/**
 * Returns events in a specific city/country.
 * Used for the location-based carousel.
 */
export const getEventsByLocation = query({
  args: {
    city: v.string(),
    country: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { city, country, limit = 20 }) => {
    const now = Date.now()
    const allEvents = await ctx.db.query("events").collect()

    return allEvents
      .filter(
        e =>
          e.status === "published" &&
          e.startDatetime >= now &&
          e.venue.city.toLowerCase() === city.toLowerCase() &&
          e.venue.country.toLowerCase() === country.toLowerCase()
      )
      .sort((a, b) => a.startDatetime - b.startDatetime)
      .slice(0, limit)
  },
})

/**
 * Returns events filtered by category.
 * Used for the category browsing carousel.
 */
export const getEventsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 20 }) => {
    const now = Date.now()

    return await ctx.db
      .query("events")
      .withIndex("by_category_status_date", q => q.eq("category", category).eq("status", "published"))
      .filter(q => q.gte(q.field("startDatetime"), now))
      .take(limit)
  },
})

/**
 * Returns trending events (most registrations in the past 7 days).
 * Used for unauthenticated visitors on the explore page.
 */
export const getTrendingEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
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
      .slice(0, limit)

    const eventIds = trending.map(a => a.eventId)
    const events = await Promise.all(eventIds.map(id => ctx.db.get("events", id)))

    return events.filter(
      (e): e is NonNullable<typeof e> => e !== null && e.status === "published" && e.startDatetime >= now
    )
  },
})

/**
 * Returns a single published event by ID for the detail page.
 * Returns null if not found, not published, or cancelled.
 */
export const getEventDetail = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get("events", eventId)
    if (!event) return null

    if (event.status === "draft") return null

    const identity = await ctx.auth.getUserIdentity()
    let user = null
    if (identity) {
      user = await ctx.db
        .query("users")
        .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
        .first()
    }

    const isOrganizer = user ? event.organizerId === user._id || event.coOrganizers.includes(user._id) : false

    if (event.status !== "published" && !isOrganizer) return null

    const organizer = await ctx.db.get("users", event.organizerId)

    let isRegistered = false
    if (user) {
      const registration = await ctx.db
        .query("registrations")
        .withIndex("by_user_event", q => q.eq("userId", user._id).eq("eventId", eventId))
        .first()
      isRegistered = registration?.status === "active"
    }

    return {
      event,
      organizer,
      isOrganizer,
      isRegistered,
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
    if (!searchQuery.trim()) return []

    const results = await ctx.db
      .query("events")
      .withSearchIndex("search_events", q => q.search("searchableText", searchQuery).eq("status", "published"))
      .take(limit)

    return results
  },
})
