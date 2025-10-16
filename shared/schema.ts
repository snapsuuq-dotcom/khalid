import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: text("tracking_number").notNull().unique(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  supplierInfo: text("supplier_info").notNull(),
  originCity: text("origin_city").notNull(),
  destination: text("destination").notNull(),
  currentStatus: text("current_status").notNull().default("pending"),
  notes: text("notes"),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const statusUpdates = pgTable("status_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentId: varchar("shipment_id").notNull().references(() => shipments.id),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  notes: text("notes"),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  trackingNumber: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  estimatedDelivery: z.string().optional(),
});

export const insertStatusUpdateSchema = createInsertSchema(statusUpdates).omit({
  id: true,
  timestamp: true,
});

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type StatusUpdate = typeof statusUpdates.$inferSelect;
export type InsertStatusUpdate = z.infer<typeof insertStatusUpdateSchema>;

export const SHIPMENT_STATUSES = [
  "pending",
  "order_placed",
  "departed_china",
  "in_transit",
  "customs_clearance",
  "delivered",
] as const;

export type ShipmentStatus = typeof SHIPMENT_STATUSES[number];

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending",
  order_placed: "Order Placed",
  departed_china: "Departed China",
  in_transit: "In Transit",
  customs_clearance: "Customs Clearance",
  delivered: "Delivered",
};

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  order_placed: "bg-chart-1/10 text-chart-1",
  departed_china: "bg-chart-1/10 text-chart-1",
  in_transit: "bg-chart-3/10 text-chart-3",
  customs_clearance: "bg-chart-3/10 text-chart-3",
  delivered: "bg-chart-2/10 text-chart-2",
};
