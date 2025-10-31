import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertCheckInSchema } from "@shared/schema";
import { ZodError } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "cre8streak-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  await storage.seedRewards();

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        primaryPlatform: user.primaryPlatform,
        xpTotal: user.xpTotal,
        bestStreak: user.bestStreak,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        primaryPlatform: user.primaryPlatform,
        xpTotal: user.xpTotal,
        bestStreak: user.bestStreak,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", async (req, res, next) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        primaryPlatform: user.primaryPlatform,
        xpTotal: user.xpTotal,
        bestStreak: user.bestStreak,
      });
    } catch (error) {
      next(error);
    }
  });

  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  app.get("/api/me", requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const streak = await storage.getUserStreak(user.id, user.primaryPlatform);
      const recentCheckIns = await storage.getRecentCheckIns(user.id, 7);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          primaryPlatform: user.primaryPlatform,
          xpTotal: user.xpTotal,
          bestStreak: user.bestStreak,
        },
        currentStreak: streak?.currentStreak || 0,
        lastCheckIn: streak?.lastCheckInDate,
        recentCheckIns,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/check-ins", requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const result = await storage.recordCheckIn(user.id, user.primaryPlatform);
      res.json(result);
    } catch (error: any) {
      if (error.message === "Already checked in today") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  });

  app.get("/api/check-ins", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const checkIns = await storage.getRecentCheckIns(req.session.userId!, limit);
      res.json(checkIns);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/leaderboard", async (req, res, next) => {
    try {
      const metric = (req.query.metric as "streak" | "xp") || "xp";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const leaderboard = await storage.getLeaderboard(metric, limit);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/rewards", async (req, res, next) => {
    try {
      const rewards = await storage.listRewards();
      res.json(rewards);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/rewards/:id/redeem", requireAuth, async (req, res, next) => {
    try {
      const redemption = await storage.redeemReward(req.session.userId!, req.params.id);
      res.json(redemption);
    } catch (error: any) {
      if (error.message === "Insufficient XP") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  });

  app.get("/api/redemptions", requireAuth, async (req, res, next) => {
    try {
      const redemptions = await storage.getUserRedemptions(req.session.userId!);
      res.json(redemptions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/xp-transactions", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const transactions = await storage.getXPTransactions(req.session.userId!, limit);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
