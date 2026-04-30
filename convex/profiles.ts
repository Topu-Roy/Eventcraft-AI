import { v } from "convex/values"
import { DEFAULT_PLAN } from "@/lib/plan.config"
import { mutation, query } from "./_generated/server"
import { authComponent } from "./betterAuth/auth"

const MAX_STRING_LENGTH = 200
const MAX_INTERESTS = 20
const MAX_INTEREST_LENGTH = 50

function sanitizeString(str: string, maxLength: number = MAX_STRING_LENGTH): string {
  return str.trim().slice(0, maxLength)
}

/**
 * Returns the current user's profile.
 */
export const getCurrent = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { error: true, message: "Not authenticated", cause: "unauthenticated" as const, data: null }
    }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()

    if (!profile) {
      return { error: false, message: null, cause: null, data: null }
    }

    const baUser = await authComponent.getAuthUser(ctx as never)
    const role: string = baUser.role ?? "user"

    return { error: false, message: null, cause: null, data: { ...profile, role } }
  },
})

/**
 * Creates a profile for the current BetterAuth user.
 */
export const create = mutation({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { error: true, message: "Not authenticated", cause: "unauthenticated" as const, data: null }
    }

    const existing = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()

    if (existing) {
      return { error: false, message: null, cause: null, data: existing._id }
    }

    const baUser = await authComponent.getAuthUser(ctx as never)

    const profileId = await ctx.db.insert("profile", {
      userId: identity.subject,
      name: sanitizeString(baUser.name),
      avatarUrl: baUser.image ?? undefined,
      plan: DEFAULT_PLAN,
      interests: [],
      location: undefined,
      timezone: undefined,
      onboardingComplete: false,
    })

    return { error: false, message: null, cause: null, data: profileId }
  },
})

/**
 * Completes onboarding: saves interests, location, timezone.
 */
export const completeOnboarding = mutation({
  args: {
    interests: v.array(v.string()),
    city: v.string(),
    country: v.string(),
    countryCode: v.string(),
    lat: v.number(),
    lng: v.number(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { error: true, message: "Not authenticated", cause: "unauthenticated" as const, data: null }
    }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()

    if (!profile) {
      const baUser = await authComponent.getAuthUser(ctx as never)
      const profileId = await ctx.db.insert("profile", {
        userId: identity.subject,
        name: sanitizeString(baUser.name),
        avatarUrl: baUser.image ?? undefined,
        plan: DEFAULT_PLAN,
        interests: args.interests.slice(0, MAX_INTERESTS).map(sanitizeString),
        location: {
          city: sanitizeString(args.city),
          country: sanitizeString(args.country),
          countryCode: sanitizeString(args.countryCode, 2),
          lat: args.lat,
          lng: args.lng,
        },
        timezone: sanitizeString(args.timezone),
        onboardingComplete: true,
      })
      return { error: false, message: null, cause: null, data: profileId }
    }

    await ctx.db.patch("profile", profile._id, {
      interests: args.interests.slice(0, MAX_INTERESTS).map(s => sanitizeString(s, MAX_INTEREST_LENGTH)),
      location: {
        city: sanitizeString(args.city),
        country: sanitizeString(args.country),
        countryCode: sanitizeString(args.countryCode, 2),
        lat: args.lat,
        lng: args.lng,
      },
      timezone: sanitizeString(args.timezone),
      onboardingComplete: true,
    })

    return { error: false, message: null, cause: null, data: profile._id }
  },
})
