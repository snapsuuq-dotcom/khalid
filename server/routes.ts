import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCargoSchema } from "@shared/schema";
import session from "express-session";
import MemoryStoreFactory from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStore = MemoryStoreFactory(session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({ checkPeriod: 1000 * 60 * 60 }),
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: false,
      },
    }),
  );

  // Auth routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (email === "admin333@gmail.com" && password === "snapsuuq321") {
      (req.session as any).user = { role: "admin", email };
      return res.json({ ok: true });
    }
    return res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if ((req.session as any).user) return res.json((req.session as any).user);
    return res.status(401).json({ error: "Unauthorized" });
  });

  function requireAdmin(req: any, res: any, next: any) {
    if (req.session?.user?.role === "admin") return next();
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Public cargo endpoints
  app.get("/api/cargo", async (req, res) => {
    try {
      const status = (req.query.status as string | undefined) || undefined;
      const q = (req.query.q as string | undefined) || undefined;
      const list = await storage.listCargo({ status, q });
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch cargo" });
    }
  });

  app.get("/api/cargo/:id", async (req, res) => {
    try {
      const item = await storage.getCargo(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch cargo" });
    }
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      const s = await storage.stats();
      res.json(s);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin cargo management
  app.post("/api/admin/cargo", requireAdmin, async (req, res) => {
    try {
      const data = insertCargoSchema.parse(req.body);
      const created = await storage.createCargo(data);
      res.status(201).json(created);
    } catch (e: any) {
      if (e?.name === "ZodError") return res.status(400).json({ error: "Invalid data", details: e });
      res.status(500).json({ error: "Failed to create cargo" });
    }
  });

  app.put("/api/admin/cargo/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateCargo(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update cargo" });
    }
  });

  app.delete("/api/admin/cargo/:id", requireAdmin, async (req, res) => {
    try {
      const ok = await storage.deleteCargo(req.params.id);
      res.json({ ok });
    } catch {
      res.status(500).json({ error: "Failed to delete cargo" });
    }
  });

  app.post("/api/admin/cargo/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body as { status?: string };
      if (!status) return res.status(400).json({ error: "Status is required" });
      const updated = await storage.updateCargoStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || "Failed to update status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
