import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Returns the onboarding document for the current authenticated user.
 * Returns null if no onboarding document exists yet.
 */
export const get = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) return null

    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .first()

    return onboarding
  },
})

/**
 * Saves step one data (interests) to the onboarding document.
 * Creates the document if it doesn't exist yet.
 * Adds step 1 to completedSteps array.
 */
export const saveStepOne = mutation({
  args: {
    interests: v.array(v.string()),
  },
  handler: async (ctx, { interests }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const existing = await ctx.db
      .query("onboarding")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .first()

    if (existing) {
      await ctx.db.patch("onboarding", existing._id, {
        stepOneData: { interests },
        completedSteps: existing.completedSteps.includes(1)
          ? existing.completedSteps
          : [...existing.completedSteps, 1],
      })
      return existing._id
    }

    return await ctx.db.insert("onboarding", {
      userId: user._id,
      completedSteps: [1],
      stepOneData: { interests },
      stepTwoData: {
        city: "",
        country: "",
        countryCode: "",
        lat: 0,
        lng: 0,
        timezone: "",
      },
    })
  },
})

/**
 * Saves step two data (location) to the onboarding document.
 * Adds step 2 to completedSteps array.
 */
export const saveStepTwo = mutation({
  args: {
    city: v.string(),
    country: v.string(),
    countryCode: v.string(),
    lat: v.number(),
    lng: v.number(),
    timezone: v.string(),
  },
  handler: async (ctx, { city, country, countryCode, lat, lng, timezone }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", q => q.eq("authId", identity.subject))
      .first()

    if (!user) throw new Error("User not found")

    const existing = await ctx.db
      .query("onboarding")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .first()

    if (existing) {
      await ctx.db.patch("onboarding", existing._id, {
        stepTwoData: { city, country, countryCode, lat, lng, timezone },
        completedSteps: existing.completedSteps.includes(2)
          ? existing.completedSteps
          : [...existing.completedSteps, 2],
      })
      return existing._id
    }

    return await ctx.db.insert("onboarding", {
      userId: user._id,
      completedSteps: [2],
      stepOneData: { interests: [] },
      stepTwoData: { city, country, countryCode, lat, lng, timezone },
    })
  },
})
