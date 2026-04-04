import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Returns all events for the current profile (including co-organizer access).
 */
export const getMyEvents = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return []

    const organized = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    const allEvents = await ctx.db.query("events").collect()
    const coOrganized = allEvents.filter(
      e => e.coOrganizers.includes(profile._id) && e.organizerId !== profile._id
    )

    return [...organized, ...coOrganized].sort((a, b) => b._creationTime - a._creationTime)
  },
})

/**
 * Returns a single event by ID with organizer access check.
 */
export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return null

    const event = await ctx.db.get("events", eventId)
    if (!event) return null

    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) return null
    return event
  },
})

/**
 * Creates a new event as a draft. Enforces free plan limit.
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
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
    coverPhoto: v.object({
      url: v.string(),
      dominantColor: v.string(),
      photographerName: v.string(),
      photographerUrl: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) throw new Error("Profile not found")

    const activeEvents = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    const qualifyingCount = activeEvents.filter(e => e.status === "draft" || e.status === "published").length

    if (profile.plan === "free" && qualifyingCount >= 1) {
      throw new Error("Free plan limit reached. Upgrade to Pro to create more events.")
    }

    const searchableText = `${args.title} ${args.description} ${args.tags.join(" ")}`.toLowerCase()

    const eventId = await ctx.db.insert("events", {
      organizerId: profile._id,
      title: args.title,
      description: args.description,
      category: args.category,
      tags: args.tags,
      coverPhoto: args.coverPhoto,
      status: "draft",
      venue: args.venue,
      startDatetime: args.startDatetime,
      endDatetime: args.endDatetime,
      capacity: args.capacity,
      registrationCount: 0,
      isFeatured: false,
      coOrganizers: [],
      searchableText,
    })

    await ctx.db.insert("eventAnalytics", {
      eventId,
      dailyCounts: {},
      totalRegistrations: 0,
      totalCheckedIn: 0,
    })

    return eventId
  },
})

/**
 * Updates an existing event. Only the organizer or co-organizers can edit.
 */
export const update = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    venue: v.optional(
      v.object({
        name: v.string(),
        address: v.string(),
        city: v.string(),
        country: v.string(),
        lat: v.number(),
        lng: v.number(),
      })
    ),
    startDatetime: v.optional(v.number()),
    endDatetime: v.optional(v.number()),
    capacity: v.optional(v.union(v.null(), v.number())),
    coverPhoto: v.optional(
      v.object({
        url: v.string(),
        dominantColor: v.string(),
        photographerName: v.string(),
        photographerUrl: v.string(),
      })
    ),
    theme: v.optional(
      v.object({
        accentColor: v.string(),
        layoutVariant: v.union(v.literal("default"), v.literal("minimal"), v.literal("bold")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) throw new Error("Profile not found")

    const event = await ctx.db.get("events", args.eventId)
    if (!event) throw new Error("Event not found")

    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) {
      throw new Error("Not authorized to edit this event")
    }

    if (args.theme && profile.plan !== "pro") {
      throw new Error("Theme customization requires a Pro plan")
    }

    const updates: Record<string, unknown> = {}
    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.category !== undefined) updates.category = args.category
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.venue !== undefined) updates.venue = args.venue
    if (args.startDatetime !== undefined) updates.startDatetime = args.startDatetime
    if (args.endDatetime !== undefined) updates.endDatetime = args.endDatetime
    if (args.capacity !== undefined) updates.capacity = args.capacity
    if (args.coverPhoto !== undefined) updates.coverPhoto = args.coverPhoto
    if (args.theme !== undefined) updates.theme = args.theme

    if (args.title || args.description || args.tags) {
      const newText =
        `${args.title ?? event.title} ${args.description ?? event.description} ${(args.tags ?? event.tags).join(" ")}`.toLowerCase()
      updates.searchableText = newText
    }

    await ctx.db.patch("events", event._id, updates)
    return event._id
  },
})

/**
 * Publishes a draft event.
 */
export const publish = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) throw new Error("Profile not found")

    const event = await ctx.db.get("events", eventId)
    if (!event) throw new Error("Event not found")
    if (event.organizerId !== profile._id) throw new Error("Only the organizer can publish this event")
    if (event.status !== "draft") throw new Error("Only draft events can be published")
    if (!event.coverPhoto) throw new Error("A cover photo is required to publish")

    await ctx.db.patch("events", event._id, { status: "published" })
    return event._id
  },
})

/**
 * Cancels a published event.
 */
export const cancel = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) throw new Error("Profile not found")

    const event = await ctx.db.get("events", eventId)
    if (!event) throw new Error("Event not found")
    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) {
      throw new Error("Not authorized to cancel this event")
    }

    await ctx.db.patch("events", event._id, { status: "cancelled" })
    return event._id
  },
})

/**
 * Returns the count of active events for the current profile.
 */
export const getActiveEventCount = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return 0

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return 0

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    return events.filter(e => e.status === "draft" || e.status === "published").length
  },
})

/**
 * Returns the current profile's plan and event usage.
 */
export const getPlanUsage = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return null

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    const activeCount = events.filter(e => e.status === "draft" || e.status === "published").length

    return {
      plan: profile.plan,
      activeCount,
      limit: profile.plan === "free" ? 1 : Infinity,
      canCreate: profile.plan === "pro" || activeCount < 1,
    }
  },
})
