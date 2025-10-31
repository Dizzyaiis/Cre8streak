import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const platformEnum = pgEnum("platform", ["youtube", "tiktok", "facebook", "instagram", "threads"]);
export const checkInSourceEnum = pgEnum("check_in_source", ["manual", "api"]);
export const xpReasonEnum = pgEnum("xp_reason", ["daily_checkin", "streak_milestone", "reward_redemption", "manual_grant"]);
export const rewardStatusEnum = pgEnum("reward_status", ["active", "upcoming", "expired"]);
export const fulfillmentTypeEnum = pgEnum("fulfillment_type", ["digital", "consult", "discount", "course"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  primaryPlatform: platformEnum("primary_platform").notNull().default("youtube"),
  providerUserId: text("provider_user_id"),
  xpTotal: integer("xp_total").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastCheckInDate: date("last_check_in_date"),
  streakStartDate: date("streak_start_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  checkInDate: date("check_in_date").notNull(),
  source: checkInSourceEnum("source").notNull().default("manual"),
  xpAwarded: integer("xp_awarded").notNull().default(10),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const xpTransactions = pgTable("xp_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: xpReasonEnum("reason").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpCost: integer("xp_cost").notNull(),
  status: rewardStatusEnum("status").notNull().default("active"),
  fulfillmentType: fulfillmentTypeEnum("fulfillment_type").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const redemptions = pgTable("redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rewardId: varchar("reward_id").notNull().references(() => rewards.id),
  xpSpent: integer("xp_spent").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  primaryPlatform: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  platform: true,
});

export const insertRewardSchema = createInsertSchema(rewards);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type XpTransaction = typeof xpTransactions.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
