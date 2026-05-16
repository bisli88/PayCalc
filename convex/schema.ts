import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Auth tables - required by @convex-dev/auth
const authTables = {
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("userId", ["userId"]),

  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    secret: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
  })
    .index("userIdAndProvider", ["userId", "provider"])
    .index("providerAndAccountId", ["provider", "providerAccountId"]),

  authVerificationCodes: defineTable({
    accountId: v.string(),
    provider: v.string(),
    code: v.string(),
    expirationTime: v.number(),
    verifier: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
  }).index("accountId", ["accountId"]),

  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.string(),
  }).index("signature", ["signature"]),

  authRefreshTokens: defineTable({
    sessionId: v.id("authSessions"),
    expirationTime: v.number(),
  }).index("sessionId", ["sessionId"]),

  authRateLimits: defineTable({
    identifier: v.string(),
    lastAttemptTime: v.number(),
    attemptsLeft: v.number(),
  }).index("identifier", ["identifier"]),
};

export default defineSchema({
  ...authTables,

  businesses: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    hourlyRate: v.number(),
  }).index("by_user", ["userId"]),

  workSessions: defineTable({
    userId: v.string(),
    businessId: v.id("businesses"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    hours: v.number(),
    total: v.number(),
    note: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_business", ["userId", "businessId"]),
});