import { v } from "convex/values"
import { array as zArray, object as zObject, string as zString } from "zod"
import { canCreateEvent, getMaxEvents } from "../lib/plan.config"
import { action, mutation, query, type QueryCtx } from "./_generated/server"
import { eventGeneratorAgent } from "./agents/eventGenerator"
import { eventModifierAgent } from "./agents/eventModifier"

const MAX_STRING_LENGTH = 200
const MAX_TAGS = 20

function sanitizeString(str: string, maxLength: number = MAX_STRING_LENGTH): string {
  return str.trim().slice(0, maxLength)
}

async function getProfileOrNull(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  return ctx.db
    .query("profile")

    .withIndex("by_userId", q => q.eq("userId", identity.subject))
    .first()
}

/**
 * Returns all events for the current profile (including co-organizer access).
 */
export const getMyEvents = query({
  args: {},
  handler: async ctx => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: [] }
    }

    const organized = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    const allEvents = await ctx.db.query("events").collect()
    const coOrganized = allEvents.filter(
      e => e.coOrganizers.includes(profile._id) && e.organizerId !== profile._id
    )

    const combined = [...organized, ...coOrganized].sort((a, b) => b._creationTime - a._creationTime)
    return { error: false, message: null, cause: null, data: combined }
  },
})

/**
 * Returns a single event by ID with organizer access check.
 */
export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    const event = await ctx.db.get("events", eventId)
    if (!event) {
      return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }
    }

    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) {
      return { error: true, message: "Not authorized", cause: "not_authorized" as const, data: null }
    }

    return { error: false, message: null, cause: null, data: event }
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
    capacity: v.optional(v.number()),
    coverPhoto: v.optional(v.id("_storage")),
    themeColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    const activeEvents = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    const qualifyingCount = activeEvents.filter(e => e.status === "draft" || e.status === "published").length

    if (!canCreateEvent(profile.plan, qualifyingCount)) {
      return { error: true, message: "Plan limit reached", cause: "plan_limit_reached" as const, data: null }
    }

    const searchableText = `${args.title} ${args.description} ${args.tags.join(" ")}`.toLowerCase()

    const eventId = await ctx.db.insert("events", {
      organizerId: profile._id,
      title: sanitizeString(args.title),
      description: sanitizeString(args.description, 2000),
      category: sanitizeString(args.category),
      tags: args.tags.slice(0, MAX_TAGS).map(t => sanitizeString(t, 50)),
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
      isSeed: false,
    })

    await ctx.db.insert("eventAnalytics", {
      eventId,
      dailyCounts: {},
      totalRegistrations: 0,
      totalCheckedIn: 0,
    })

    return { error: false, message: null, cause: null, data: eventId }
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
    coverPhoto: v.optional(v.id("_storage")),
    themeColor: v.optional(v.string()),
    theme: v.optional(
      v.object({
        accentColor: v.string(),
        layoutVariant: v.union(v.literal("default"), v.literal("minimal"), v.literal("bold")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    const event = await ctx.db.get("events", args.eventId)
    if (!event) {
      return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }
    }

    const isOrganizer = event.organizerId === profile._id
    const isCoOrganizer = event.coOrganizers.includes(profile._id)
    if (!isOrganizer && !isCoOrganizer) {
      return { error: true, message: "Not authorized", cause: "not_authorized" as const, data: null }
    }

    if (args.theme && profile.plan !== "pro") {
      return { error: true, message: "Pro plan required", cause: "pro_plan_required" as const, data: null }
    }

    const updates: Record<string, unknown> = {}
    if (args.title !== undefined) updates.title = sanitizeString(args.title)
    if (args.description !== undefined) updates.description = sanitizeString(args.description, 2000)
    if (args.category !== undefined) updates.category = sanitizeString(args.category)
    if (args.tags !== undefined) updates.tags = args.tags.slice(0, MAX_TAGS).map(t => sanitizeString(t, 50))
    if (args.venue !== undefined) updates.venue = args.venue
    if (args.startDatetime !== undefined) updates.startDatetime = args.startDatetime
    if (args.endDatetime !== undefined) updates.endDatetime = args.endDatetime
    if (args.capacity !== undefined) updates.capacity = args.capacity
    if (args.coverPhoto !== undefined) updates.coverPhoto = args.coverPhoto
    if (args.themeColor !== undefined) updates.themeColor = sanitizeString(args.themeColor, 20)
    if (args.theme !== undefined) updates.theme = args.theme

    if (args.title || args.description || args.tags) {
      const newText =
        `${args.title ?? event.title} ${args.description ?? event.description} ${(args.tags ?? event.tags).join(" ")}`.toLowerCase()
      updates.searchableText = newText
    }

    await ctx.db.patch("events", event._id, updates)
    return { error: false, message: null, cause: null, data: event._id }
  },
})

/**
 * Publishes a draft event.
 */
export const publish = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    const event = await ctx.db.get("events", eventId)
    if (!event) {
      return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }
    }
    if (event.organizerId !== profile._id) {
      return { error: true, message: "Only organizer can publish", cause: "not_authorized" as const, data: null }
    }
    if (event.status !== "draft") {
      return { error: true, message: "Only drafts can be published", cause: "invalid_status" as const, data: null }
    }
    if (!event.coverPhoto) {
      return { error: true, message: "Cover photo required", cause: "missing_cover_photo" as const, data: null }
    }

    await ctx.db.patch("events", event._id, { status: "published" })
    return { error: false, message: null, cause: null, data: event._id }
  },
})

/**
 * Cancels a published event.
 */
export const cancel = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    const event = await ctx.db.get("events", eventId)
    if (!event) {
      return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }
    }

    const isOrganizer = event.organizerId === profile._id
    const isCoOrganizer = event.coOrganizers.includes(profile._id)
    if (!isOrganizer && !isCoOrganizer) {
      return { error: true, message: "Not authorized", cause: "not_authorized" as const, data: null }
    }

    await ctx.db.patch("events", event._id, { status: "cancelled" })
    return { error: false, message: null, cause: null, data: event._id }
  },
})

/**
 * Returns the count of active events for the current profile.
 */
export const getActiveEventCount = query({
  args: {},
  handler: async ctx => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: 0 }
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    const count = events.filter(e => e.status === "draft" || e.status === "published").length
    return { error: false, message: null, cause: null, data: count }
  },
})

/**
 * Returns the current profile's plan and event usage.
 */
export const getPlanUsage = query({
  args: {},
  handler: async ctx => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", q => q.eq("organizerId", profile._id))
      .collect()

    const activeCount = events.filter(e => e.status === "draft" || e.status === "published").length

    return {
      error: false,
      message: null,
      cause: null,
      data: {
        plan: profile.plan,
        activeCount,
        limit: getMaxEvents(profile.plan) ?? Infinity,
        canCreate: canCreateEvent(profile.plan, activeCount),
      },
    }
  },
})

/**
 * Generates structured event data from a natural language prompt using Gemini.
 */
export const generateFromPrompt = action({
  args: { prompt: v.string(), categorySlugs: v.array(v.string()) },
  handler: async (ctx, { prompt, categorySlugs }) => {
    const { thread } = await eventGeneratorAgent.createThread(ctx)

    const categoryContext = `Available category slugs: ${JSON.stringify(categorySlugs)}. You must use exactly one of these for the category field.`

    const { object: generatedData } = await thread.generateObject({
      prompt: `${categoryContext}\n\nGenerate event data from this description: ${prompt}`,
      schema: zObject({
        title: zString().min(3).max(200),
        description: zString().min(50).max(2000),
        category: zString(),
        tags: zArray(zString().max(50)),
      }),
      schemaName: "EventData",
      schemaDescription: "Structured event data generated from a prompt",
    })

    if (!categorySlugs.includes(generatedData.category)) {
      return {
        error: true,
        message: `The AI picked "${generatedData.category}" which isn't a valid category. Try describing the event type more clearly.`,
        cause: "invalid_category" as const,
        data: null,
      }
    }

    return { error: false, message: null, cause: null, data: generatedData }
  },
})

/**
 * Modifies existing generated event data based on a user instruction.
 */
export const modifyEventData = action({
  args: {
    previousData: v.object({
      title: v.string(),
      description: v.string(),
      category: v.string(),
      tags: v.array(v.string()),
    }),
    modification: v.string(),
    categorySlugs: v.array(v.string()),
  },
  handler: async (ctx, { previousData, modification, categorySlugs }) => {
    const { thread } = await eventModifierAgent.createThread(ctx)

    const { object: modifiedData } = await thread.generateObject({
      prompt: `Previous event data:
Title: ${previousData.title}
Description: ${previousData.description}
Category: ${previousData.category}
Tags: ${JSON.stringify(previousData.tags)}

Available category slugs: ${JSON.stringify(categorySlugs)}. You must use exactly one of these.

User modification instruction: ${modification}

Return a COMPLETELY NEW set of event data that incorporates the user's changes. All fields must be replaced.`,
      schema: zObject({
        title: zString().min(3).max(200),
        description: zString().min(50).max(2000),
        category: zString(),
        tags: zArray(zString().max(50)),
      }),
      schemaName: "EventData",
      schemaDescription: "Modified event data",
    })

    if (!categorySlugs.includes(modifiedData.category)) {
      return {
        error: true,
        message: `The AI picked "${modifiedData.category}" which isn't a valid category. Try a different modification.`,
        cause: "invalid_category" as const,
        data: null,
      }
    }

    return { error: false, message: null, cause: null, data: modifiedData }
  },
})
