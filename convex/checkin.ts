import { v } from "convex/values"
import { type Id } from "./_generated/dataModel"
import { mutation, query, type QueryCtx } from "./_generated/server"

const TICKET_CODE_MIN_LENGTH = 8
const TICKET_CODE_MAX_LENGTH = 64

/**
 * Verifies the user is an organizer or co-organizer of the event.
 * Returns the profile if authorized, null otherwise.
 */
async function assertEventOrganizer(ctx: QueryCtx, eventId: Id<"events">) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return { error: true, message: "Unauthenticated", cause: "unauthenticated" as const, data: null }

  const profile = await ctx.db
    .query("profile")
    .withIndex("by_userId", q => q.eq("userId", identity.subject))
    .first()
  if (!profile)
    return { error: true, message: "Profile not found", cause: "profile_not_found" as const, data: null }

  const event = await ctx.db.get("events", eventId)
  if (!event) return { error: true, message: "Event not found", cause: "event_not_found" as const, data: null }

  const isOrganizer = event.organizerId === profile._id || event.coOrganizers.includes(profile._id)
  if (!isOrganizer) return { error: true, message: "Not authorized", cause: "not_authorized" as const, data: null }

  return { error: false, profile }
}

/**
 * Scans a ticket and returns attendee details for organizer review.
 * If first scan, sets checkInStatus to "pending".
 */
export const scan = mutation({
  args: {
    ticketCode: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, { ticketCode, eventId }) => {
    if (ticketCode.length < TICKET_CODE_MIN_LENGTH || ticketCode.length > TICKET_CODE_MAX_LENGTH) {
      return { error: true, message: "Invalid ticket code", cause: "invalid_ticket_code" as const, data: null }
    }

    const authCheck = await assertEventOrganizer(ctx, eventId)
    if (authCheck.error) {
      return { error: true, message: authCheck.message, cause: authCheck.cause, data: null }
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
      .first()

    if (!registration) {
      return { error: true, message: "Ticket not found", cause: "ticket_not_found" as const, data: null }
    }
    if (registration.eventId !== eventId) {
      return {
        error: true,
        message: "Ticket belongs to a different event",
        cause: "wrong_event" as const,
        data: null,
      }
    }
    if (registration.status === "cancelled") {
      return {
        error: true,
        message: "Registration cancelled",
        cause: "registration_cancelled" as const,
        data: null,
      }
    }
    if (registration.checkInStatus === "approved") {
      return { error: true, message: "Already approved", cause: "already_approved" as const, data: null }
    }
    if (registration.checkInStatus === "rejected") {
      return { error: true, message: "Already rejected", cause: "already_rejected" as const, data: null }
    }

    if (registration.checkInStatus !== "pending") {
      await ctx.db.patch("registrations", registration._id, { checkInStatus: "pending" })
    }

    const attendee = await ctx.db.get("profile", registration.profileId)

    return {
      error: false,
      message: null,
      cause: null,
      data: {
        registrationId: registration._id,
        ticketCode,
        attendeeName: attendee?.name ?? "Unknown",
        attendeeEmail: "",
        registeredAt: registration._creationTime,
        checkInStatus: registration.checkInStatus,
      },
    }
  },
})

/**
 * Approves a scanned ticket. Sets checkInStatus to "approved" and checkedIn to true.
 */
export const approve = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, { registrationId }) => {
    const registration = await ctx.db.get("registrations", registrationId)
    if (!registration) {
      return {
        error: true,
        message: "Registration not found",
        cause: "registration_not_found" as const,
        data: null,
      }
    }

    const authCheck = await assertEventOrganizer(ctx, registration.eventId)
    if (authCheck.error) {
      return { error: true, message: authCheck.message, cause: authCheck.cause, data: null }
    }

    if (registration.checkInStatus !== "pending") {
      return { error: true, message: "Not pending approval", cause: "not_pending_approval" as const, data: null }
    }

    await ctx.db.patch("registrations", registration._id, {
      checkInStatus: "approved",
      checkedIn: true,
      checkedInAt: Date.now(),
    })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", registration.eventId))
      .first()

    if (analytics) {
      await ctx.db.patch("eventAnalytics", analytics._id, {
        totalCheckedIn: analytics.totalCheckedIn + 1,
      })
    }

    return { error: false, message: null, cause: null, data: registration._id }
  },
})

/**
 * Rejects a scanned ticket. Sets checkInStatus to "rejected".
 */
export const reject = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, { registrationId }) => {
    const registration = await ctx.db.get("registrations", registrationId)
    if (!registration) {
      return {
        error: true,
        message: "Registration not found",
        cause: "registration_not_found" as const,
        data: null,
      }
    }

    const authCheck = await assertEventOrganizer(ctx, registration.eventId)
    if (authCheck.error) {
      return { error: true, message: authCheck.message, cause: authCheck.cause, data: null }
    }

    if (registration.checkInStatus !== "pending") {
      return { error: true, message: "Not pending approval", cause: "not_pending_approval" as const, data: null }
    }

    await ctx.db.patch("registrations", registration._id, {
      checkInStatus: "rejected",
    })

    return { error: false, message: null, cause: null, data: registration._id }
  },
})

/**
 * Legacy single-step check-in (kept for compatibility).
 */
export const checkIn = mutation({
  args: {
    ticketCode: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, { ticketCode, eventId }) => {
    if (ticketCode.length < TICKET_CODE_MIN_LENGTH || ticketCode.length > TICKET_CODE_MAX_LENGTH) {
      return { error: true, message: "Invalid ticket code", cause: "invalid_ticket_code" as const, data: null }
    }

    const authCheck = await assertEventOrganizer(ctx, eventId)
    if (authCheck.error) {
      return { error: true, message: authCheck.message, cause: authCheck.cause, data: null }
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
      .first()

    if (!registration) {
      return { error: true, message: "Ticket not found", cause: "ticket_not_found" as const, data: null }
    }
    if (registration.eventId !== eventId) {
      return {
        error: true,
        message: "Ticket belongs to a different event",
        cause: "wrong_event" as const,
        data: null,
      }
    }
    if (registration.status === "cancelled") {
      return {
        error: true,
        message: "Registration cancelled",
        cause: "registration_cancelled" as const,
        data: null,
      }
    }
    if (registration.checkInStatus === "approved") {
      return {
        error: false,
        message: null,
        cause: null,
        data: {
          alreadyCheckedIn: true,
          checkedInAt: registration.checkedInAt,
          attendeeName: "Attendee",
        },
      }
    }

    await ctx.db.patch("registrations", registration._id, {
      checkInStatus: "approved",
      checkedIn: true,
      checkedInAt: Date.now(),
    })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .first()

    if (analytics) {
      await ctx.db.patch("eventAnalytics", analytics._id, { totalCheckedIn: analytics.totalCheckedIn + 1 })
    }

    const attendee = await ctx.db.get("profile", registration.profileId)
    return {
      error: false,
      message: null,
      cause: null,
      data: {
        attendeeName: attendee?.name ?? "Unknown",
        ticketCode,
      },
    }
  },
})

/**
 * Manual check-in by typing ticket code.
 */
export const manualCheckIn = mutation({
  args: {
    ticketCode: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, { ticketCode, eventId }) => {
    if (ticketCode.length < TICKET_CODE_MIN_LENGTH || ticketCode.length > TICKET_CODE_MAX_LENGTH) {
      return { error: true, message: "Invalid ticket code", cause: "invalid_ticket_code" as const, data: null }
    }

    const authCheck = await assertEventOrganizer(ctx, eventId)
    if (authCheck.error) {
      return { error: true, message: authCheck.message, cause: authCheck.cause, data: null }
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
      .first()

    if (!registration) {
      return { error: true, message: "Ticket not found", cause: "ticket_not_found" as const, data: null }
    }
    if (registration.eventId !== eventId) {
      return {
        error: true,
        message: "Ticket belongs to a different event",
        cause: "wrong_event" as const,
        data: null,
      }
    }
    if (registration.status === "cancelled") {
      return {
        error: true,
        message: "Registration cancelled",
        cause: "registration_cancelled" as const,
        data: null,
      }
    }
    if (registration.checkInStatus === "approved") {
      return {
        error: false,
        message: null,
        cause: null,
        data: {
          alreadyCheckedIn: true,
          checkedInAt: registration.checkedInAt,
          attendeeName: "Attendee",
        },
      }
    }

    await ctx.db.patch("registrations", registration._id, {
      checkInStatus: "approved",
      checkedIn: true,
      checkedInAt: Date.now(),
    })

    const analytics = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_event", q => q.eq("eventId", eventId))
      .first()

    if (analytics) {
      await ctx.db.patch("eventAnalytics", analytics._id, { totalCheckedIn: analytics.totalCheckedIn + 1 })
    }

    const attendee = await ctx.db.get("profile", registration.profileId)
    return {
      error: false,
      message: null,
      cause: null,
      data: {
        attendeeName: attendee?.name ?? "Unknown",
        ticketCode,
      },
    }
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

    const capacityRemaining = event.capacity === undefined ? "Unlimited" : event.capacity - event.registrationCount
    const engagementRate =
      analytics.totalRegistrations > 0 ? (analytics.totalCheckedIn / analytics.totalRegistrations) * 100 : 0

    return {
      totalRegistrations: analytics.totalRegistrations,
      totalCheckedIn: analytics.totalCheckedIn,
      engagementRate: Math.round(engagementRate * 100) / 100,
      capacityRemaining,
      dailyCounts: analytics.dailyCounts,
      timezone: profile.timezone,
    }
  },
})
