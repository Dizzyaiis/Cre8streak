import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import {
  users,
  streaks,
  checkIns,
  xpTransactions,
  rewards,
  redemptions,
  type User,
  type InsertUser,
  type Streak,
  type CheckIn,
  type XpTransaction,
  type Reward,
  type Redemption,
} from "@shared/schema";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: string, delta: number): Promise<void>;
  getUserStreak(userId: string, platform: string): Promise<Streak | undefined>;
  recordCheckIn(userId: string, platform: string): Promise<{ checkIn: CheckIn; xpAwarded: number; newStreak: number }>;
  getRecentCheckIns(userId: string, limit?: number): Promise<CheckIn[]>;
  getLeaderboard(metric: "streak" | "xp", limit?: number): Promise<Array<User & { rank: number }>>;
  listRewards(): Promise<Reward[]>;
  redeemReward(userId: string, rewardId: string): Promise<Redemption>;
  getUserRedemptions(userId: string): Promise<Array<Redemption & { reward: Reward }>>;
  getXPTransactions(userId: string, limit?: number): Promise<XpTransaction[]>;
  seedRewards(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    
    await db.insert(streaks).values({
      userId: result[0].id,
      platform: insertUser.primaryPlatform as "youtube" | "tiktok" | "facebook" | "instagram" | "threads",
      currentStreak: 0,
      bestStreak: 0,
    });

    return result[0];
  }

  async updateUserXP(userId: string, delta: number): Promise<void> {
    await db
      .update(users)
      .set({ xpTotal: sql`${users.xpTotal} + ${delta}` })
      .where(eq(users.id, userId));
  }

  async getUserStreak(userId: string, platform: string): Promise<Streak | undefined> {
    const result = await db
      .select()
      .from(streaks)
      .where(and(eq(streaks.userId, userId), eq(streaks.platform, platform as any)))
      .limit(1);
    return result[0];
  }

  async recordCheckIn(userId: string, platform: string): Promise<{ checkIn: CheckIn; xpAwarded: number; newStreak: number }> {
    const today = new Date().toISOString().split("T")[0];
    
    const existingCheckIn = await db
      .select()
      .from(checkIns)
      .where(and(eq(checkIns.userId, userId), eq(checkIns.checkInDate, today)))
      .limit(1);

    if (existingCheckIn.length > 0) {
      throw new Error("Already checked in today");
    }

    let streak = await this.getUserStreak(userId, platform);
    if (!streak) {
      const [newStreak] = await db.insert(streaks).values({
        userId,
        platform: platform as "youtube" | "tiktok" | "facebook" | "instagram" | "threads",
        currentStreak: 0,
        bestStreak: 0,
      }).returning();
      streak = newStreak;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreakCount = 1;
    let xpAwarded = 10;

    if (streak.lastCheckInDate === yesterday) {
      newStreakCount = (streak.currentStreak || 0) + 1;
    } else if (streak.lastCheckInDate === today) {
      newStreakCount = streak.currentStreak || 0;
    }

    if (newStreakCount % 7 === 0) {
      xpAwarded += 20;
    }

    const [checkIn] = await db.insert(checkIns).values({
      userId,
      platform: platform as "youtube" | "tiktok" | "facebook" | "instagram" | "threads",
      checkInDate: today,
      source: "manual",
      xpAwarded,
    }).returning();

    const newBestStreak = Math.max(newStreakCount, streak.bestStreak || 0);

    await db
      .update(streaks)
      .set({
        currentStreak: newStreakCount,
        bestStreak: newBestStreak,
        lastCheckInDate: today,
        streakStartDate: streak.streakStartDate || today,
        updatedAt: new Date(),
      })
      .where(eq(streaks.id, streak.id));

    await db
      .update(users)
      .set({
        xpTotal: sql`${users.xpTotal} + ${xpAwarded}`,
        bestStreak: sql`GREATEST(${users.bestStreak}, ${newBestStreak})`,
      })
      .where(eq(users.id, userId));

    await db.insert(xpTransactions).values({
      userId,
      delta: xpAwarded,
      reason: "daily_checkin",
      metadata: { platform, streak: newStreakCount },
    });

    return { checkIn, xpAwarded, newStreak: newStreakCount };
  }

  async getRecentCheckIns(userId: string, limit: number = 10): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.checkInDate))
      .limit(limit);
  }

  async getLeaderboard(metric: "streak" | "xp" = "xp", limit: number = 50): Promise<Array<User & { rank: number }>> {
    const orderBy = metric === "streak" ? desc(users.bestStreak) : desc(users.xpTotal);
    const usersList = await db.select().from(users).orderBy(orderBy).limit(limit);
    
    return usersList.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  async listRewards(): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.status, "active"));
  }

  async redeemReward(userId: string, rewardId: string): Promise<Redemption> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const reward = await db.select().from(rewards).where(eq(rewards.id, rewardId)).limit(1);
    if (!reward[0]) throw new Error("Reward not found");

    if (user.xpTotal < reward[0].xpCost) {
      throw new Error("Insufficient XP");
    }

    await db
      .update(users)
      .set({ xpTotal: sql`${users.xpTotal} - ${reward[0].xpCost}` })
      .where(eq(users.id, userId));

    await db.insert(xpTransactions).values({
      userId,
      delta: -reward[0].xpCost,
      reason: "reward_redemption",
      metadata: { rewardId, rewardTitle: reward[0].title },
    });

    const [redemption] = await db.insert(redemptions).values({
      userId,
      rewardId,
      xpSpent: reward[0].xpCost,
    }).returning();

    return redemption;
  }

  async getUserRedemptions(userId: string): Promise<Array<Redemption & { reward: Reward }>> {
    const result = await db
      .select()
      .from(redemptions)
      .leftJoin(rewards, eq(redemptions.rewardId, rewards.id))
      .where(eq(redemptions.userId, userId))
      .orderBy(desc(redemptions.createdAt));

    return result.map(row => ({
      ...row.redemptions,
      reward: row.rewards!,
    }));
  }

  async getXPTransactions(userId: string, limit: number = 20): Promise<XpTransaction[]> {
    return await db
      .select()
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId))
      .orderBy(desc(xpTransactions.createdAt))
      .limit(limit);
  }

  async seedRewards(): Promise<void> {
    const existingRewards = await db.select().from(rewards).limit(1);
    if (existingRewards.length > 0) return;

    await db.insert(rewards).values([
      {
        title: "Gift Card - $10",
        description: "Redeem for a $10 gift card to your favorite store",
        xpCost: 500,
        status: "active",
        fulfillmentType: "digital",
      },
      {
        title: "1-on-1 Coaching Session",
        description: "30-minute session with a content creation expert",
        xpCost: 1000,
        status: "active",
        fulfillmentType: "consult",
      },
      {
        title: "Premium Analytics Course",
        description: "Learn advanced analytics to grow your audience",
        xpCost: 750,
        status: "active",
        fulfillmentType: "course",
      },
      {
        title: "Video Editing Masterclass",
        description: "Professional video editing techniques and tips",
        xpCost: 800,
        status: "active",
        fulfillmentType: "course",
      },
      {
        title: "20% Off Creator Tools",
        description: "Discount on premium creator software and tools",
        xpCost: 300,
        status: "active",
        fulfillmentType: "discount",
      },
    ]);
  }
}

export const storage = new DatabaseStorage();
