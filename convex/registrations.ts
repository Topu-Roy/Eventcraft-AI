import { v } from "convex/values"
import { nanoid } from "nanoid"
import { mutation, query } from "./_generated/server"

/**
 * Registers the current profile for an event.
 */
export const register = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { error: true, cause: "Unauthenticated" as const, data: null }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return { error: true, cause: "Profile not found" as const, data: null }

    const event = await ctx.db.get("events", eventId)
    if (!event) return { error: true, cause: "Event not found" as const, data: null }
    if (event.status !== "published") return { error: true, cause: "Event not published" as const, data: null }

    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_profileId_event", q => q.eq("profileId", profile._id).eq("eventId", eventId))
      .first()

    if (existing?.status === "active") return { error: true, cause: "Already registered" as const, data: null }
    if (event.organizerId === profile._id)
      return { error: true, cause: "Organizer cannot register" as const, data: null }
    if (event.capacity !== null && event.registrationCount >= event.capacity) {
      return { error: true, cause: "Event is full" as const, data: null }
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

    if (attempts >= 3) return { error: true, cause: "Failed to generate ticket" as const, data: null }

    await ctx.db.insert("registrations", {
      profileId: profile._id,
      eventId,
      ticketCode,
      status: "active",
      checkInStatus: "pending",
      checkedIn: false,
      checkedInAt: null,
      cancelledAt: null,
    })

    await ctx.db.patch("events", event._id, { registrationCount: event.registrationCount + 1 })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .first()

    if (analytics) {
      const today = new Date().toISOString().split("T")[0]
      const dailyCounts = analytics.dailyCounts as Record<string, number>
      dailyCounts[today] = (dailyCounts[today] ?? 0) + 1
      await ctx.db.patch("eventAnalytics", analytics._id, {
        totalRegistrations: analytics.totalRegistrations + 1,
        dailyCounts,
      })
    }

    return { error: null, cause: null, data: { ticketCode, eventId } }
  },
})

/**
 * Cancels a registration.
 */
export const cancelRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, { registrationId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { error: true, cause: "Unauthenticated" as const, data: null }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return { error: true, cause: "Profile not found" as const, data: null }

    const registration = await ctx.db.get("registrations", registrationId)
    if (!registration) return { error: true, cause: "Registration not found" as const, data: null }
    if (registration.profileId !== profile._id)
      return { error: true, cause: "Not authorized" as const, data: null }
    if (registration.status !== "active") return { error: true, cause: "Not active" as const, data: null }

    const event = await ctx.db.get("events", registration.eventId)
    if (!event) return { error: true, cause: "Event not found" as const, data: null }

    const oneHourBeforeStart = event.startDatetime - 60 * 60 * 1000
    if (Date.now() > oneHourBeforeStart) {
      return { error: true, cause: "Too late to cancel" as const, data: null }
    }

    await ctx.db.patch("registrations", registration._id, { status: "cancelled", cancelledAt: Date.now() })
    await ctx.db.patch("events", event._id, { registrationCount: Math.max(0, event.registrationCount - 1) })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", event._id))
      .first()

    if (analytics) {
      const today = new Date().toISOString().split("T")[0]
      const dailyCounts = analytics.dailyCounts as Record<string, number>
      dailyCounts[today] = Math.max(0, (dailyCounts[today] ?? 1) - 1)
      await ctx.db.patch("eventAnalytics", analytics._id, {
        totalRegistrations: Math.max(0, analytics.totalRegistrations - 1),
        dailyCounts,
      })
    }

    return { error: null, cause: null, data: registration._id }
  },
})

/**
 * Returns all registrations for the current profile.
 */
export const getMyRegistrations = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return []

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_profileId_status", q => q.eq("profileId", profile._id))
      .collect()

    const events = await ctx.db.query("events").collect()
    const eventMap = new Map(events.map(e => [e._id, e]))

    return registrations
      .map(reg => ({ ...reg, event: eventMap.get(reg.eventId) }))
      .filter((r): r is typeof r & { event: NonNullable<typeof r.event> } => r.event != null)
      .sort((a, b) => (b.event?.startDatetime ?? 0) - (a.event?.startDatetime ?? 0))
  },
})

/**
 * Returns a single registration by ticket code.
 */
export const getByTicketCode = query({
  args: { ticketCode: v.string() },
  handler: async (ctx, { ticketCode }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return null

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
      .first()

    if (registration?.profileId !== profile._id) return null

    const event = await ctx.db.get("events", registration.eventId)
    return { registration, event }
  },
})

/**
 * Returns all registrations for an event (organizer only).
 */
export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) return []

    const event = await ctx.db.get("events", eventId)
    if (!event) return []
    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) return []

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_eventId_status", q => q.eq("eventId", eventId))
      .collect()

    const profileIds = [...new Set(registrations.map(r => r.profileId))]
    const profiles = await Promise.all(profileIds.map(id => ctx.db.get("profile", id)))
    const profileMap = new Map(profiles.filter(Boolean).map(p => [p!._id, p]))

    return registrations.map(reg => ({
      ...reg,
      profile: profileMap.get(reg.profileId),
    }))
  },
})
