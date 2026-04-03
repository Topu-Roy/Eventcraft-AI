import { v } from "convex/values"
import { nanoid } from "nanoid"
import { mutation, query } from "./_generated/server"

/**
 * Registers the current user for an event.
 * Atomic operation: checks capacity, prevents duplicates, generates ticket, increments counters.
 */
export const register = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const event = await ctx.db.get(eventId)
    if (!event) throw new Error("Event not found")

    if (event.status !== "published") {
      throw new Error("Can only register for published events")
    }

    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_user_event", q => q.eq("userId", user._id).eq("eventId", eventId))
      .first()

    if (existingRegistration) {
      if (existingRegistration.status === "active") {
        throw new Error("Already registered for this event")
      }
    }

    if (event.organizerId === user._id) {
      throw new Error("Organizers cannot register for their own events")
    }

    if (event.capacity !== null && event.registrationCount >= event.capacity) {
      throw new Error("Event is full")
    }

    let ticketCode: string
    let attempts = 0
    const maxAttempts = 3

    do {
      ticketCode = nanoid(12)
      const collision = await ctx.db
        .query("registrations")
        .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
        .first()

      if (!collision) break
      attempts++
    } while (attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique ticket code")
    }

    await ctx.db.insert("registrations", {
      userId: user._id,
      eventId,
      ticketCode,
      status: "active",
      checkedIn: false,
      checkedInAt: null,
      cancelledAt: null,
    })

    await ctx.db.patch("events", event._id, {
      registrationCount: event.registrationCount + 1,
    })

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

    return { ticketCode, eventId }
  },
})

/**
 * Cancels a registration. Only allowed up to 1 hour before event start.
 */
export const cancelRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, { registrationId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const registration = await ctx.db.get(registrationId)
    if (!registration) throw new Error("Registration not found")

    if (registration.userId !== user._id) {
      throw new Error("Not authorized to cancel this registration")
    }

    if (registration.status !== "active") {
      throw new Error("Registration is not active")
    }

    const event = await ctx.db.get(registration.eventId)
    if (!event) throw new Error("Event not found")

    const oneHourBeforeStart = event.startDatetime - 60 * 60 * 1000
    if (Date.now() > oneHourBeforeStart) {
      throw new Error("Cannot cancel registration within 1 hour of event start")
    }

    await ctx.db.patch("registrations", registration._id, {
      status: "cancelled",
      cancelledAt: Date.now(),
    })

    await ctx.db.patch("events", event._id, {
      registrationCount: Math.max(0, event.registrationCount - 1),
    })

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

    return registration._id
  },
})

/**
 * Returns all active registrations for the current user.
 */
export const getMyRegistrations = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return []

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect()

    const events = await ctx.db.query("events").collect()
    const eventMap = new Map(events.map(e => [e._id, e]))

    return registrations
      .map(reg => ({
        ...reg,
        event: eventMap.get(reg.eventId),
      }))
      .filter(r => r.event)
      .sort((a, b) => {
        const dateA = a.event?.startDatetime ?? 0
        const dateB = b.event?.startDatetime ?? 0
        return dateB - dateA
      })
  },
})

/**
 * Returns a single registration by ticket code with event details.
 */
export const getByTicketCode = query({
  args: { ticketCode: v.string() },
  handler: async (ctx, { ticketCode }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return null

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
      .first()

    if (!registration) return null
    if (registration.userId !== user._id) return null

    const event = await ctx.db.get(registration.eventId)

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

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return []

    const event = await ctx.db.get(eventId)
    if (!event) return []

    if (event.organizerId !== user._id && !event.coOrganizers.includes(user._id)) {
      return []
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .collect()

    const userIds = [...new Set(registrations.map(r => r.userId))]
    const users = await Promise.all(userIds.map(id => ctx.db.get(id)))
    const userMap = new Map(users.filter(Boolean).map(u => [u!._id, u]))

    return registrations.map(reg => ({
      ...reg,
      user: userMap.get(reg.userId),
    }))
  },
})
