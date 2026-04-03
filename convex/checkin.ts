import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"

type CheckInResult =
  | { status: "success"; attendeeName: string; ticketCode: string }
  | { status: "already_checked_in"; checkedInAt: number | null | undefined; attendeeName: string }
  | { status: "invalid"; reason: string }

async function executeCheckIn(
  ctx: MutationCtx,
  ticketCode: string,
  eventId: Id<"events">
): Promise<CheckInResult> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Unauthenticated")

  const user = await ctx.db
    .query("users")
    .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
    .first()

  if (!user) throw new Error("User not found")

  const event = await ctx.db.get("events", eventId)
  if (!event) {
    return { status: "invalid", reason: "Event not found" }
  }

  if (event.organizerId !== user._id && !event.coOrganizers.includes(user._id)) {
    return { status: "invalid", reason: "Not authorized" }
  }

  const registration = await ctx.db
    .query("registrations")
    .withIndex("by_ticket_code", q => q.eq("ticketCode", ticketCode))
    .first()

  if (!registration) {
    return { status: "invalid", reason: "Ticket not found" }
  }

  if (registration.eventId !== eventId) {
    return {
      status: "invalid",
      reason: "Ticket belongs to a different event",
    }
  }

  if (registration.status === "cancelled") {
    return { status: "invalid", reason: "Registration cancelled" }
  }

  if (registration.checkedIn) {
    return {
      status: "already_checked_in",
      checkedInAt: registration.checkedInAt,
      attendeeName: "Attendee",
    }
  }

  await ctx.db.patch("registrations", registration._id, {
    checkedIn: true,
    checkedInAt: Date.now(),
  })

  const analytics = await ctx.db
    .query("eventAnalytics")
    .withIndex("by_event", q => q.eq("eventId", eventId))
    .first()

  if (analytics) {
    await ctx.db.patch("eventAnalytics", analytics._id, {
      totalCheckedIn: analytics.totalCheckedIn + 1,
    })
  }

  const attendee = await ctx.db.get("users", registration.userId)

  return {
    status: "success",
    attendeeName: attendee?.name ?? "Unknown",
    ticketCode,
  }
}

/**
 * Checks in an attendee by ticket code.
 * Three outcomes: valid first scan, already checked in, or invalid.
 */
export const checkIn = mutation({
  args: { ticketCode: v.string(), eventId: v.id("events") },
  handler: async (ctx, { ticketCode, eventId }) => {
    return executeCheckIn(ctx, ticketCode, eventId)
  },
})

/**
 * Manual check-in by typing ticket code.
 * Same mutation path as QR scanner.
 */
export const manualCheckIn = mutation({
  args: { ticketCode: v.string(), eventId: v.id("events") },
  handler: async (ctx, { ticketCode, eventId }) => {
    return executeCheckIn(ctx, ticketCode, eventId)
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return null

    const event = await ctx.db.get("events", eventId)
    if (!event) return null

    if (event.organizerId !== user._id && !event.coOrganizers.includes(user._id)) {
      return null
    }

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
      timezone: user.timezone,
    }
  },
})
