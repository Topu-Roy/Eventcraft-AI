import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { authComponent } from "./betterAuth/auth"

/**
 * Returns the onboarding document for the current authenticated profile.
 */
export const get = query({
  args: {},
  handler: async ctx => {
    const baUser = await authComponent.getAuthUser(ctx as never)
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", baUser._id))
      .first()
    if (!profile) return null

    return await ctx.db
      .query("onboarding")
      .withIndex("profileId", q => q.eq("profileId", profile._id))
      .first()
  },
})

/**
 * Saves step one data (interests) to the onboarding document.
 */
export const saveStepOne = mutation({
  args: { interests: v.array(v.string()) },
  handler: async (ctx, { interests }) => {
    const baUser = await authComponent.getAuthUser(ctx as never)
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", baUser._id))
      .first()
    if (!profile) return { error: true, cause: "Profile not found" as const, data: null }

    const existing = await ctx.db
      .query("onboarding")
      .withIndex("profileId", q => q.eq("profileId", profile._id))
      .first()

    if (existing) {
      await ctx.db.patch("onboarding", existing._id, {
        stepOneData: { interests },
        completedSteps: existing.completedSteps.includes(1)
          ? existing.completedSteps
          : [...existing.completedSteps, 1],
      })
      return { error: null, cause: null, data: existing._id }
    }

    const id = await ctx.db.insert("onboarding", {
      profileId: profile._id,
      completedSteps: [1],
      stepOneData: { interests },
      stepTwoData: { city: "", country: "", countryCode: "", lat: 0, lng: 0, timezone: "" },
    })

    return { error: null, cause: null, data: id }
  },
})

/**
 * Saves step two data (location) to the onboarding document.
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
    const baUser = await authComponent.getAuthUser(ctx as never)
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", q => q.eq("userId", baUser._id))
      .first()
    if (!profile) return { error: true, cause: "Profile not found" as const, data: null }

    const existing = await ctx.db
      .query("onboarding")
      .withIndex("profileId", q => q.eq("profileId", profile._id))
      .first()

    if (existing) {
      await ctx.db.patch("onboarding", existing._id, {
        stepTwoData: { city, country, countryCode, lat, lng, timezone },
        completedSteps: existing.completedSteps.includes(2)
          ? existing.completedSteps
          : [...existing.completedSteps, 2],
      })
      return { error: null, cause: null, data: existing._id }
    }

    const id = await ctx.db.insert("onboarding", {
      profileId: profile._id,
      completedSteps: [2],
      stepOneData: { interests: [] },
      stepTwoData: { city, country, countryCode, lat, lng, timezone },
    })

    return { error: null, cause: null, data: id }
  },
})
