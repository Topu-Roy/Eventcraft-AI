import { v } from "convex/values"
import { DEFAULT_PLAN } from "../lib/plan.config"
import { mutation, query } from "./_generated/server"
import { authComponent } from "./betterAuth/auth"

/**
 * Returns the current user's profile.
 * Returns null if no profile exists yet (first login).
 */
export const getCurrent = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { error: true, cause: "Unauthenticated" as const, data: null }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()

    return { error: null, cause: null, data: profile }
  },
})

/**
 * Creates a profile for the current BetterAuth user.
 * Called on first login or during onboarding.
 * Idempotent — returns existing profile if one already exists.
 */
export const create = mutation({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { error: true, cause: "Unauthenticated" as const, data: null }

    const existing = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()

    if (existing) return { error: null, cause: null, data: existing._id }

    const baUser = await authComponent.getAuthUser(ctx as never)

    const profileId = await ctx.db.insert("profile", {
      userId: identity.subject,
      name: baUser.name,
      avatarUrl: baUser.image ?? undefined,
      plan: DEFAULT_PLAN,
      interests: [],
      location: undefined,
      timezone: undefined,
      onboardingComplete: false,
    })

    return { error: null, cause: null, data: profileId }
  },
})

/**
 * Completes onboarding: saves interests, location, timezone, and marks onboardingComplete.
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
    if (!identity) return { error: true, cause: "Unauthenticated" as const, data: null }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", identity.subject))
      .first()

    if (!profile) {
      const baUser = await authComponent.getAuthUser(ctx as never)
      const profileId = await ctx.db.insert("profile", {
        userId: identity.subject,
        name: baUser.name,
        avatarUrl: baUser.image ?? undefined,
        plan: DEFAULT_PLAN,
        interests: args.interests,
        location: {
          city: args.city,
          country: args.country,
          countryCode: args.countryCode,
          lat: args.lat,
          lng: args.lng,
        },
        timezone: args.timezone,
        onboardingComplete: true,
      })
      return { error: null, cause: null, data: profileId }
    }

    await ctx.db.patch("profile", profile._id, {
      interests: args.interests,
      location: {
        city: args.city,
        country: args.country,
        countryCode: args.countryCode,
        lat: args.lat,
        lng: args.lng,
      },
      timezone: args.timezone,
      onboardingComplete: true,
    })

    return { error: null, cause: null, data: profile._id }
  },
})
