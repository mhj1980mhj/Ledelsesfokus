import { User, InsertUser, PowerBIDashboard, InsertPowerBIDashboard } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Power BI Dashboards
  getAllDashboards(): Promise<PowerBIDashboard[]>;
  getDashboard(id: string): Promise<PowerBIDashboard | null>;
  createDashboard(dashboard: InsertPowerBIDashboard): Promise<PowerBIDashboard>;
  updateDashboard(id: string, dashboard: Partial<InsertPowerBIDashboard>): Promise<PowerBIDashboard | null>;
  deleteDashboard(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dashboards: PowerBIDashboard[] = [
    {
      id: "1",
      name: "Beboerunders\u00f8gelse",
      url: "https://app.powerbi.com/reportEmbed?reportId=0772dd9a-24d5-4c64-917e-d50287fcca79&autoAuth=true&ctid=a917771d-94b6-4ac6-8b4f-0d496cfb0e43",
      description: "Analyse af beboertilfredshed og demografi",
      category: "Beboeranalyse",
      createdAt: new Date().toISOString(),
      isActive: 1
    },
    {
      id: "2",
      name: "Økonomisk Dashboard",
      url: "",
      description: "Finansiel rapportering og budgetanalyse",
      category: "Økonomi",
      createdAt: new Date().toISOString(),
      isActive: 1
    },
    {
      id: "3",
      name: "Vedligeholdelse Oversigt",
      url: "",
      description: "Sporingsværktøjer for ejendomsvedligeholdelse",
      category: "Vedligeholdelse",
      createdAt: new Date().toISOString(),
      isActive: 1
    },
    {
      id: "4",
      name: "Ejendomsportefølje",
      url: "",
      description: "Performance og værdivurdering af ejendomme",
      category: "Ejendomme",
      createdAt: new Date().toISOString(),
      isActive: 1
    }
  ];

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllDashboards(): Promise<PowerBIDashboard[]> {
    return this.dashboards.filter(d => d.isActive === 1);
  }

  async getDashboard(id: string): Promise<PowerBIDashboard | null> {
    return this.dashboards.find(d => d.id === id && d.isActive === 1) || null;
  }

  async createDashboard(dashboard: InsertPowerBIDashboard): Promise<PowerBIDashboard> {
    const newDashboard: PowerBIDashboard = {
      id: randomUUID(),
      name: dashboard.name,
      url: dashboard.url,
      description: dashboard.description || null,
      category: dashboard.category || "General",
      createdAt: new Date().toISOString(),
      isActive: 1
    };
    this.dashboards.push(newDashboard);
    return newDashboard;
  }

  async updateDashboard(id: string, dashboard: Partial<InsertPowerBIDashboard>): Promise<PowerBIDashboard | null> {
    const index = this.dashboards.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    this.dashboards[index] = { ...this.dashboards[index], ...dashboard };
    return this.dashboards[index];
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const index = this.dashboards.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.dashboards[index].isActive = 0;
    return true;
  }
}

export const storage = new MemStorage();