import { v } from "convex/values"
import { nanoid } from "nanoid"
import { mutation, query, type QueryCtx } from "./_generated/server"

const MAX_STRING_LENGTH = 200

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

async function getProfileOrThrow(ctx: QueryCtx) {
  const profile = await getProfileOrNull(ctx)
  if (!profile) return null
  return profile
}

/**
 * Registers the current profile for an event.
 */
export const register = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const profile = await getProfileOrThrow(ctx)
    if (!profile)
      return {
        error: true,
        message: "You must be logged in to register",
        cause: "unauthenticated" as const,
        data: null,
      }

    const event = await ctx.db.get("events", eventId)
    if (!event) return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }
    if (event.status !== "published")
      return {
        error: true,
        message: "Event is not available for registration",
        cause: "event_not_published" as const,
        data: null,
      }

    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_profileId_event", q => q.eq("profileId", profile._id).eq("eventId", eventId))
      .first()

    if (existing?.status === "active")
      return {
        error: true,
        message: "You are already registered for this event",
        cause: "already_registered" as const,
        data: null,
      }
    if (event.organizerId === profile._id)
      return {
        error: true,
        message: "Organizers cannot register for their own events",
        cause: "organizer_cannot_register" as const,
        data: null,
      }
    if (event.capacity !== undefined && event.registrationCount >= event.capacity) {
      return { error: true, message: "This event is full", cause: "event_full" as const, data: null }
    }

    let ticketCode: string
    let attempts = 0
    do {
      ticketCode = nanoid(12)
      const collision = await ctx.db
        .query("registrations")
        .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
        .first()
      if (!collision) break
      attempts++
    } while (attempts < 3)

    if (attempts >= 3)
      return {
        error: true,
        message: "Failed to generate ticket code",
        cause: "ticket_generation_failed" as const,
        data: null,
      }

    await ctx.db.insert("registrations", {
      profileId: profile._id,
      eventId,
      ticketCode,
      status: "active",
      checkInStatus: "pending",
      checkedIn: false,
      checkedInAt: undefined,
      cancelledAt: undefined,
    })

    await ctx.db.patch("events", event._id, { registrationCount: event.registrationCount + 1 })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .first()

    if (analytics) {
      const today = new Date().toISOString().split("T")[0]
      const dailyCounts = analytics.dailyCounts
      dailyCounts[today] = (dailyCounts[today] ?? 0) + 1
      await ctx.db.patch("eventAnalytics", analytics._id, {
        totalRegistrations: analytics.totalRegistrations + 1,
        dailyCounts,
      })
    }

    return { error: false, message: null, cause: null, data: { ticketCode, eventId } }
  },
})

/**
 * Cancels a registration.
 */
export const cancelRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, { registrationId }) => {
    const profile = await getProfileOrThrow(ctx)
    if (!profile)
      return {
        error: true,
        message: "You must be logged in to cancel registration",
        cause: "unauthenticated" as const,
        data: null,
      }

    const registration = await ctx.db.get("registrations", registrationId)
    if (!registration)
      return {
        error: true,
        message: "Registration not found",
        cause: "registration_not_found" as const,
        data: null,
      }
    if (registration.profileId !== profile._id)
      return {
        error: true,
        message: "You are not authorized to cancel this registration",
        cause: "not_authorized" as const,
        data: null,
      }
    if (registration.status !== "active")
      return { error: true, message: "Registration is not active", cause: "not_active" as const, data: null }

    const event = await ctx.db.get("events", registration.eventId)
    if (!event) return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }

    const oneHourBeforeStart = event.startDatetime - 60 * 60 * 1000
    if (Date.now() > oneHourBeforeStart) {
      return {
        error: true,
        message: "Cannot cancel less than 1 hour before event starts",
        cause: "too_late_to_cancel" as const,
        data: null,
      }
    }

    await ctx.db.patch("registrations", registration._id, { status: "cancelled", cancelledAt: Date.now() })
    await ctx.db.patch("events", event._id, { registrationCount: Math.max(0, event.registrationCount - 1) })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", event._id))
      .first()

    if (analytics) {
      const today = new Date().toISOString().split("T")[0]
      const dailyCounts = analytics.dailyCounts
      dailyCounts[today] = Math.max(0, (dailyCounts[today] ?? 1) - 1)
      await ctx.db.patch("eventAnalytics", analytics._id, {
        totalRegistrations: Math.max(0, analytics.totalRegistrations - 1),
        dailyCounts,
      })
    }

    return { error: false, message: null, cause: null, data: registration._id }
  },
})

/**
 * Returns all registrations for the current profile.
 */
export const getMyRegistrations = query({
  args: {},
  handler: async ctx => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: [] }
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_profileId_status", q => q.eq("profileId", profile._id))
      .collect()

    const events = await ctx.db.query("events").collect()
    const eventMap = new Map(events.map(e => [e._id, e]))

    const result = registrations
      .map(reg => ({ ...reg, event: eventMap.get(reg.eventId) }))
      .filter((r): r is typeof r & { event: NonNullable<typeof r.event> } => r.event != null)
      .sort((a, b) => (b.event?.startDatetime ?? 0) - (a.event?.startDatetime ?? 0))

    return { error: false, message: null, cause: null, data: result }
  },
})

/**
 * Returns a single registration by ticket code.
 */
export const getByTicketCode = query({
  args: { ticketCode: v.string() },
  handler: async (ctx, { ticketCode }) => {
    const sanitizedTicketCode = sanitizeString(ticketCode, 50)

    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", sanitizedTicketCode))
      .first()

    if (!registration) {
      return {
        error: true,
        message: "Registration not found",
        cause: "registration_not_found" as const,
        data: null,
      }
    }

    if (registration.profileId !== profile._id) {
      return {
        error: true,
        message: "Registration not found",
        cause: "registration_not_found" as const,
        data: null,
      }
    }

    const event = await ctx.db.get("events", registration.eventId)
    return { error: false, message: null, cause: null, data: { registration, event } }
  },
})

/**
 * Returns all registrations for an event (organizer only).
 */
export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const profile = await getProfileOrNull(ctx)
    if (!profile) {
      return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: [] }
    }

    const event = await ctx.db.get("events", eventId)
    if (!event) return { error: true, message: "Event not found", cause: "event_not_found" as const, data: [] }
    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) {
      return {
        error: true,
        message: "You are not authorized to view this event's registrations",
        cause: "not_authorized" as const,
        data: [],
      }
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_eventId_status", q => q.eq("eventId", eventId))
      .collect()

    const profileIds = [...new Set(registrations.map(r => r.profileId))]
    const profiles = await Promise.all(profileIds.map(id => ctx.db.get("profile", id)))
    const profileMap = new Map(profiles.filter(Boolean).map(p => [p!._id, p]))

    const result = registrations.map(reg => ({
      ...reg,
      profile: profileMap.get(reg.profileId),
    }))

    return { error: false, message: null, cause: null, data: result }
  },
})
