import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShipmentSchema, insertStatusUpdateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/shipments", async (req, res) => {
    try {
      const statusFilter = req.query.status as string | undefined;
      const shipments = await storage.getAllShipments(statusFilter);
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipments" });
    }
  });

  app.get("/api/shipments/:id", async (req, res) => {
    try {
      const shipment = await storage.getShipment(req.params.id);
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipment" });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const validatedData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(validatedData);
      res.status(201).json(shipment);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid shipment data", details: error });
      }
      res.status(500).json({ error: "Failed to create shipment" });
    }
  });

  app.get("/api/shipments/:id/status-updates", async (req, res) => {
    try {
      const statusUpdates = await storage.getStatusUpdatesByShipmentId(req.params.id);
      res.json(statusUpdates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch status updates" });
    }
  });

  app.post("/api/shipments/:id/status", async (req, res) => {
    try {
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const shipment = await storage.getShipment(req.params.id);
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }

      const updatedShipment = await storage.updateShipmentStatus(req.params.id, status);

      const statusUpdateData = {
        shipmentId: req.params.id,
        status,
        notes: notes || null,
      };
      
      await storage.createStatusUpdate(statusUpdateData);

      res.json(updatedShipment);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Invalid status') || 
        error.message.includes('Cannot move backwards') ||
        error.message.includes('Cannot skip stages')
      )) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to update shipment status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
