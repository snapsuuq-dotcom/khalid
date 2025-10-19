import { z } from "zod";

// TruckNumber Cargo System shared domain

export const CARGO_STATUSES = [
  "china",
  "on_air",
  "on_sea",
  "arrived",
  "delivered",
] as const;

export type CargoStatus = typeof CARGO_STATUSES[number];

export const STATUS_LABELS: Record<CargoStatus, string> = {
  china: "China",
  on_air: "On Air",
  on_sea: "On Sea",
  arrived: "Arrived",
  delivered: "Delivered",
};

export const STATUS_COLORS: Record<CargoStatus, string> = {
  china: "bg-muted text-muted-foreground",
  on_air: "bg-chart-3/10 text-chart-3",
  on_sea: "bg-chart-4/10 text-chart-4",
  arrived: "bg-chart-1/10 text-chart-1",
  delivered: "bg-chart-2/10 text-chart-2",
};

export const insertCargoSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  productName: z.string().min(1, "Product name is required"),
  truckNumber: z.string().min(1, "Truck number is required"),
  date: z.string().min(1, "Date is required"), // ISO date string
  status: z.enum(CARGO_STATUSES),
});

export type InsertCargo = z.infer<typeof insertCargoSchema>;

export interface Cargo {
  id: string; // maps from Mongo _id
  customerName: string;
  phoneNumber: string;
  productName: string;
  truckNumber: string;
  date: string; // ISO string in API responses
  status: CargoStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
