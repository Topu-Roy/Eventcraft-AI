import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Checks in an attendee by ticket code.
 */
export const checkIn = mutation({
  args: { ticketCode: v.string(), eventId: v.id("events") },
  handler: async (ctx, { ticketCode, eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) throw new Error("Profile not found")

    const event = await ctx.db.get("events", eventId)
    if (!event) return { status: "invalid" as const, reason: "Event not found" }

    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) {
      return { status: "invalid" as const, reason: "Not authorized" }
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
      .first()

    if (!registration) return { status: "invalid" as const, reason: "Ticket not found" }
    if (registration.eventId !== eventId) {
      return { status: "invalid" as const, reason: "Ticket belongs to a different event" }
    }
    if (registration.status === "cancelled") {
      return { status: "invalid" as const, reason: "Registration cancelled" }
    }
    if (registration.checkedIn) {
      return {
        status: "already_checked_in" as const,
        checkedInAt: registration.checkedInAt,
        attendeeName: "Attendee",
      }
    }

    await ctx.db.patch("registrations", registration._id, { checkedIn: true, checkedInAt: Date.now() })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .first()

    if (analytics) {
      await ctx.db.patch("eventAnalytics", analytics._id, { totalCheckedIn: analytics.totalCheckedIn + 1 })
    }

    const attendee = await ctx.db.get("profile", registration.profileId)

    return { status: "success" as const, attendeeName: attendee?.name ?? "Unknown", ticketCode }
  },
})

/**
 * Manual check-in by typing ticket code.
 */
export const manualCheckIn = mutation({
  args: { ticketCode: v.string(), eventId: v.id("events") },
  handler: async (ctx, { ticketCode, eventId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()
    if (!profile) throw new Error("Profile not found")

    const event = await ctx.db.get("events", eventId)
    if (!event) return { status: "invalid" as const, reason: "Event not found" }
    if (event.organizerId !== profile._id && !event.coOrganizers.includes(profile._id)) {
      return { status: "invalid" as const, reason: "Not authorized" }
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
      .first()

    if (!registration) return { status: "invalid" as const, reason: "Ticket not found" }
    if (registration.eventId !== eventId) {
      return { status: "invalid" as const, reason: "Ticket belongs to a different event" }
    }
    if (registration.status === "cancelled") {
      return { status: "invalid" as const, reason: "Registration cancelled" }
    }
    if (registration.checkedIn) {
      return {
        status: "already_checked_in" as const,
        checkedInAt: registration.checkedInAt,
        attendeeName: "Attendee",
      }
    }

    await ctx.db.patch("registrations", registration._id, { checkedIn: true, checkedInAt: Date.now() })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .first()

    if (analytics) {
      await ctx.db.patch("eventAnalytics", analytics._id, { totalCheckedIn: analytics.totalCheckedIn + 1 })
    }

    const attendee = await ctx.db.get("profile", registration.profileId)
    return { status: "success" as const, attendeeName: attendee?.name ?? "Unknown", ticketCode }
  },
})

/**
 * Returns analytics for a specific event (organizer only).
 */
export const getEventAnalytics = query({
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

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .first()

    if (!analytics) return null

    const capacityRemaining = event.capacity === null ? "Unlimited" : event.capacity - event.registrationCount
    const engagementRate =
      analytics.totalRegistrations > 0 ? (analytics.totalCheckedIn / analytics.totalRegistrations) * 100 : 0

    return {
      totalRegistrations: analytics.totalRegistrations,
      totalCheckedIn: analytics.totalCheckedIn,
      engagementRate: Math.round(engagementRate * 100) / 100,
      capacityRemaining,
      dailyCounts: analytics.dailyCounts as Record<string, number>,
      timezone: profile.timezone,
    }
  },
})
