import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Returns the current authenticated user's profile.
 * Uses ctx.auth.getUserIdentity() to get the BetterAuth user ID,
 * then looks up the corresponding record in our users table.
 */
export const getCurrentUser = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    return user
  },
})

/**
 * Returns a user by their BetterAuth authId.
 * Used by server-side guards and layout components.
 */
export const getByAuthId = query({
  args: { authId: v.string() },
  handler: async (ctx, { authId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", authId))
      .first()
  },
})

/**
 * Creates or updates a user record after successful BetterAuth signup.
 * Called from the onboarding flow or a post-auth hook.
 * Sets onboardingComplete to false by default.
 */
export const createOrUpdate = mutation({
  args: {
    authId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { authId, email, name, avatarUrl }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", authId))
      .first()

    if (existing) {
      return existing._id
    }

    const userId = await ctx.db.insert("users", {
      authId,
      email,
      name,
      avatarUrl,
      role: "attendee",
      plan: "free",
      interests: [],
      location: undefined,
      timezone: undefined,
      onboardingComplete: false,
    })

    return userId
  },
})

/**
 * Updates the user's onboarding data after completing the wizard.
 * Sets interests, location, timezone, and marks onboardingComplete as true.
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
  handler: async (ctx, { interests, city, country, countryCode, lat, lng, timezone }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    await ctx.db.patch("users", user._id, {
      interests,
      location: { city, country, countryCode, lat, lng },
      timezone,
      onboardingComplete: true,
    })

    return user._id
  },
})
