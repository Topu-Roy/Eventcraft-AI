import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Returns all events for the current authenticated organizer (including co-organizer access).
 */
export const getMyEvents = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return []

    const organized = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", user._id))
      .collect()

    const coOrganized = await ctx.db.query("events").collect()
    const coOrganizedFiltered = coOrganized.filter(
      e => e.coOrganizers.includes(user._id) && e.organizerId !== user._id
    )

    return [...organized, ...coOrganizedFiltered].sort((a, b) => b._creationTime - a._creationTime)
  },
})

/**
 * Returns a single event by ID with organizer access check.
 * Returns null if event doesn't exist or user has no access.
 */
export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return null

    const event = await ctx.db.get("events", eventId)
    if (!event) return null

    const isOrganizer = event.organizerId === user._id || event.coOrganizers.includes(user._id)

    if (!isOrganizer) return null

    return event
  },
})

/**
 * Creates a new event as a draft.
 * Enforces free plan limit: free users can only have 1 active event (draft + published).
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const activeEvents = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", user._id))
      .collect()

    const qualifyingCount = activeEvents.filter(e => e.status === "draft" || e.status === "published").length

    if (user.plan === "free" && qualifyingCount >= 1) {
      throw new Error("Free plan limit reached. Upgrade to Pro to create more events.")
    }

    const searchableText = `${args.title} ${args.description} ${args.tags.join(" ")}`.toLowerCase()

    const eventId = await ctx.db.insert("events", {
      organizerId: user._id,
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const event = await ctx.db.get("events", args.eventId)
    if (!event) throw new Error("Event not found")

    if (event.organizerId !== user._id && !event.coOrganizers.includes(user._id)) {
      throw new Error("Not authorized to edit this event")
    }

    if (args.theme && user.plan !== "pro") {
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
 * Publishes a draft event. Sets status to "published".
 */
export const publish = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const event = await ctx.db.get("events", eventId)
    if (!event) throw new Error("Event not found")

    if (event.organizerId !== user._id) {
      throw new Error("Only the organizer can publish this event")
    }

    if (event.status !== "draft") {
      throw new Error("Only draft events can be published")
    }

    if (!event.coverPhoto) {
      throw new Error("A cover photo is required to publish")
    }

    await ctx.db.patch("events", event._id, { status: "published" })

    return event._id
  },
})

/**
 * Cancels a published event. Sets status to "cancelled".
 */
export const cancel = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const event = await ctx.db.get("events", eventId)
    if (!event) throw new Error("Event not found")

    if (event.organizerId !== user._id && !event.coOrganizers.includes(user._id)) {
      throw new Error("Not authorized to cancel this event")
    }

    await ctx.db.patch("events", event._id, { status: "cancelled" })

    return event._id
  },
})

/**
 * Returns the count of active events (draft + published) for the current user.
 * Used for plan limit enforcement.
 */
export const getActiveEventCount = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return 0

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return 0

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", user._id))
      .collect()

    return events.filter(e => e.status === "draft" || e.status === "published").length
  },
})

/**
 * Returns the current user's plan and event usage.
 */
export const getPlanUsage = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return null

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", user._id))
      .collect()

    const activeCount = events.filter(e => e.status === "draft" || e.status === "published").length

    return {
      plan: user.plan,
      activeCount,
      limit: user.plan === "free" ? 1 : Infinity,
      canCreate: user.plan === "pro" || activeCount < 1,
    }
  },
})
