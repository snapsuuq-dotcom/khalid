import { 
  type Shipment, 
  type InsertShipment,
  type StatusUpdate,
  type InsertStatusUpdate,
  SHIPMENT_STATUSES,
  STATUS_LABELS,
  type ShipmentStatus
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipment(id: string): Promise<Shipment | undefined>;
  getAllShipments(statusFilter?: string): Promise<Shipment[]>;
  updateShipmentStatus(id: string, status: string): Promise<Shipment | undefined>;
  
  createStatusUpdate(statusUpdate: InsertStatusUpdate): Promise<StatusUpdate>;
  getStatusUpdatesByShipmentId(shipmentId: string): Promise<StatusUpdate[]>;
  validateStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; error?: string };
}

export class MemStorage implements IStorage {
  private shipments: Map<string, Shipment>;
  private statusUpdates: Map<string, StatusUpdate>;

  constructor() {
    this.shipments = new Map();
    this.statusUpdates = new Map();
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const id = randomUUID();
    const trackingNumber = this.generateTrackingNumber();
    const now = new Date();
    
    const shipment: Shipment = {
      ...insertShipment,
      id,
      trackingNumber,
      estimatedDelivery: insertShipment.estimatedDelivery 
        ? new Date(insertShipment.estimatedDelivery)
        : null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.shipments.set(id, shipment);
    
    const initialStatusUpdate: StatusUpdate = {
      id: randomUUID(),
      shipmentId: id,
      status: insertShipment.currentStatus,
      timestamp: now,
      notes: "Shipment created",
    };
    this.statusUpdates.set(initialStatusUpdate.id, initialStatusUpdate);
    
    return shipment;
  }

  async getShipment(id: string): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  async getAllShipments(statusFilter?: string): Promise<Shipment[]> {
    let shipments = Array.from(this.shipments.values());
    
    if (statusFilter && statusFilter !== 'all') {
      shipments = shipments.filter(s => s.currentStatus === statusFilter);
    }
    
    return shipments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  validateStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; error?: string } {
    if (!SHIPMENT_STATUSES.includes(newStatus as ShipmentStatus)) {
      return {
        valid: false,
        error: `Invalid status: ${newStatus}. Must be one of: ${SHIPMENT_STATUSES.join(', ')}`
      };
    }

    if (currentStatus === newStatus) {
      return { valid: true };
    }

    if (newStatus === 'pending') {
      return { valid: true };
    }

    const currentIndex = SHIPMENT_STATUSES.indexOf(currentStatus as ShipmentStatus);
    const newIndex = SHIPMENT_STATUSES.indexOf(newStatus as ShipmentStatus);

    if (newIndex !== currentIndex + 1) {
      const nextStatus = SHIPMENT_STATUSES[currentIndex + 1];
      return {
        valid: false,
        error: `Cannot skip stages. Current status is ${STATUS_LABELS[currentStatus as ShipmentStatus]}. Next valid status is ${nextStatus ? STATUS_LABELS[nextStatus] : 'none (already at final stage)'}.`
      };
    }

    return { valid: true };
  }

  async updateShipmentStatus(id: string, status: string): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) {
      return undefined;
    }

    const validation = this.validateStatusTransition(shipment.currentStatus, status);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const updatedShipment: Shipment = {
      ...shipment,
      currentStatus: status,
      updatedAt: new Date(),
    };

    this.shipments.set(id, updatedShipment);
    return updatedShipment;
  }

  async createStatusUpdate(insertStatusUpdate: InsertStatusUpdate): Promise<StatusUpdate> {
    const id = randomUUID();
    const statusUpdate: StatusUpdate = {
      ...insertStatusUpdate,
      id,
      timestamp: new Date(),
    };

    this.statusUpdates.set(id, statusUpdate);
    return statusUpdate;
  }

  async getStatusUpdatesByShipmentId(shipmentId: string): Promise<StatusUpdate[]> {
    return Array.from(this.statusUpdates.values())
      .filter(update => update.shipmentId === shipmentId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private generateTrackingNumber(): string {
    const prefix = "CN-SL";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}

export const storage = new MemStorage();
