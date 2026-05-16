import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Businesses ────────────────────────────────────────────
export const getBusinesses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("businesses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const addBusiness = mutation({
  args: { name: v.string(), color: v.string(), hourlyRate: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("businesses", {
      userId: identity.subject,
      name: args.name,
      color: args.color,
      hourlyRate: args.hourlyRate,
    });
  },
});

export const updateBusiness = mutation({
  args: {
    id: v.id("businesses"),
    name: v.string(),
    color: v.string(),
    hourlyRate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(args.id, {
      name: args.name,
      color: args.color,
      hourlyRate: args.hourlyRate,
    });
  },
});

export const deleteBusiness = mutation({
  args: { id: v.id("businesses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Delete all sessions for this business
    const sessions = await ctx.db
      .query("workSessions")
      .withIndex("by_user_business", (q) =>
        q.eq("userId", identity.subject).eq("businessId", args.id)
      )
      .collect();
    for (const s of sessions) await ctx.db.delete(s._id);
    await ctx.db.delete(args.id);
  },
});

// ─── Work Sessions ─────────────────────────────────────────
export const getSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("workSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const addSession = mutation({
  args: {
    businessId: v.id("businesses"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    hours: v.number(),
    total: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("workSessions", {
      userId: identity.subject,
      ...args,
    });
  },
});

export const deleteSession = mutation({
  args: { id: v.id("workSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
  },
});