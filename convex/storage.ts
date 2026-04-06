import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Generates an upload URL for event cover photos.
 * The client uploads directly to this URL, then passes the storageId to the event creation/update mutation.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Gets a public URL for a stored file.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  },
})

/**
 * Deletes a file from Convex storage.
 * Only the event organizer can delete their cover photo.
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    await ctx.storage.delete(storageId)
  },
})
