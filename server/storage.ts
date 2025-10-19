import { MongoClient, ObjectId, type Db, type Collection } from "mongodb";
import {
  CARGO_STATUSES,
  STATUS_LABELS,
  type CargoStatus,
  type InsertCargo,
  type Cargo,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createCargo(cargo: InsertCargo): Promise<Cargo>;
  updateCargo(id: string, cargo: Partial<InsertCargo>): Promise<Cargo | undefined>;
  deleteCargo(id: string): Promise<boolean>;
  getCargo(id: string): Promise<Cargo | undefined>;
  listCargo(params: { status?: string; q?: string } | undefined): Promise<Cargo[]>;
  updateCargoStatus(id: string, status: string): Promise<Cargo | undefined>;
  validateStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; error?: string };
  stats(): Promise<{ total: number; china: number; on_air: number; on_sea: number; arrived: number; delivered: number }>;
}

type CargoDoc = {
  _id: ObjectId;
  customerName: string;
  phoneNumber: string;
  productName: string;
  truckNumber: string;
  date: Date;
  status: CargoStatus;
  createdAt: Date;
  updatedAt: Date;
};

function toCargo(doc: CargoDoc): Cargo {
  return {
    id: doc._id.toHexString(),
    customerName: doc.customerName,
    phoneNumber: doc.phoneNumber,
    productName: doc.productName,
    truckNumber: doc.truckNumber,
    date: doc.date.toISOString(),
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

class MongoStorage implements IStorage {
  private client: MongoClient;
  private db!: Db;
  private cargoCol!: Collection<CargoDoc>;
  private initialized = false;

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri);
    // lazy init on first use
  }

  private async ensureConnected() {
    if (!this.initialized) {
      await this.client.connect();
      const dbName = process.env.MONGO_DB || "trucknumber";
      this.db = this.client.db(dbName);
      this.cargoCol = this.db.collection<CargoDoc>("cargo");
      await Promise.all([
        this.cargoCol.createIndex({ truckNumber: 1 }),
        this.cargoCol.createIndex({ phoneNumber: 1 }),
        this.cargoCol.createIndex({ customerName: 1 }),
        this.cargoCol.createIndex({ status: 1, date: -1 }),
      ]);
      this.initialized = true;
    }
  }

  validateStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; error?: string } {
    if (!CARGO_STATUSES.includes(newStatus as CargoStatus)) {
      return { valid: false, error: `Invalid status: ${newStatus}` };
    }
    // allow any forward move among defined states (no strict sequence enforced here)
    if (currentStatus === newStatus) return { valid: true };
    return { valid: true };
  }

  async createCargo(cargo: InsertCargo): Promise<Cargo> {
    await this.ensureConnected();
    const now = new Date();
    const doc: Omit<CargoDoc, "_id"> = {
      customerName: cargo.customerName,
      phoneNumber: cargo.phoneNumber,
      productName: cargo.productName,
      truckNumber: cargo.truckNumber,
      date: new Date(cargo.date),
      status: cargo.status,
      createdAt: now,
      updatedAt: now,
    };
    const res = await this.cargoCol.insertOne(doc as CargoDoc);
    const inserted = await this.cargoCol.findOne({ _id: res.insertedId });
    return toCargo(inserted as CargoDoc);
  }

  async updateCargo(id: string, cargo: Partial<InsertCargo>): Promise<Cargo | undefined> {
    await this.ensureConnected();
    const update: Partial<CargoDoc> = {};
    if (cargo.customerName !== undefined) update.customerName = cargo.customerName;
    if (cargo.phoneNumber !== undefined) update.phoneNumber = cargo.phoneNumber;
    if (cargo.productName !== undefined) update.productName = cargo.productName;
    if (cargo.truckNumber !== undefined) update.truckNumber = cargo.truckNumber;
    if (cargo.date !== undefined) update.date = new Date(cargo.date);
    if (cargo.status !== undefined) update.status = cargo.status as CargoStatus;
    update.updatedAt = new Date();
    const res = await this.cargoCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return res ? toCargo(res as unknown as CargoDoc) : undefined;
  }

  async deleteCargo(id: string): Promise<boolean> {
    await this.ensureConnected();
    const res = await this.cargoCol.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount === 1;
  }

  async getCargo(id: string): Promise<Cargo | undefined> {
    await this.ensureConnected();
    const doc = await this.cargoCol.findOne({ _id: new ObjectId(id) });
    return doc ? toCargo(doc) : undefined;
  }

  async listCargo(params?: { status?: string; q?: string }): Promise<Cargo[]> {
    await this.ensureConnected();
    const filter: any = {};
    if (params?.status && params.status !== "all") {
      filter.status = params.status;
    }
    if (params?.q) {
      const q = params.q.trim();
      filter.$or = [
        { truckNumber: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { phoneNumber: { $regex: q, $options: "i" } },
      ];
    }
    const docs = await this.cargoCol.find(filter).sort({ createdAt: -1 }).limit(200).toArray();
    return docs.map(toCargo);
  }

  async updateCargoStatus(id: string, status: string): Promise<Cargo | undefined> {
    await this.ensureConnected();
    const existing = await this.cargoCol.findOne({ _id: new ObjectId(id) });
    if (!existing) return undefined;
    const validation = this.validateStatusTransition(existing.status, status);
    if (!validation.valid) throw new Error(validation.error);
    const res = await this.cargoCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: status as CargoStatus, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return res ? toCargo(res as unknown as CargoDoc) : undefined;
  }

  async stats() {
    await this.ensureConnected();
    const total = await this.cargoCol.estimatedDocumentCount();
    const byStatus = await this.cargoCol.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).toArray();
    const base = { china: 0, on_air: 0, on_sea: 0, arrived: 0, delivered: 0 } as Record<CargoStatus, number>;
    for (const s of byStatus) base[s._id as CargoStatus] = s.count as number;
    return { total, ...base } as any;
  }
}

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGO_DB || "trucknumber";
export const storage: IStorage = new MongoStorage(mongoUri, dbName);
