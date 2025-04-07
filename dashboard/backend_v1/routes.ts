import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed database with demo data
  try {
    await storage.seedDemoData();
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }

  // Setup authentication routes
  setupAuth(app);

  // API routes
  app.get("/api/calls", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const calls = await storage.getCalls(req.user!.id);
      res.json(calls);
    } catch (error) {
      console.error("Error fetching calls:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const stats = await storage.getCallStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user!;
      const stats = await storage.getCallStats(user.id);
      const calls = await storage.getCalls(user.id);

      // Remove password from user data
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        stats,
        calls
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
