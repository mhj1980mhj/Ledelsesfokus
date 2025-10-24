import { User, InsertUser, PowerBIDashboard, InsertPowerBIDashboard, Project, InsertProject, Segment, InsertSegment, users, powerBIDashboards, projects, segments } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
  
  // Segments
  getSegmentsByProject(projectId: string): Promise<Segment[]>;
  getSegment(id: string): Promise<Segment | null>;
  createSegment(segment: InsertSegment): Promise<Segment>;
  updateSegment(id: string, segment: Partial<InsertSegment>): Promise<Segment | null>;
  deleteSegment(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private users: Map<string, User>;
  private isInitialized = false;

  constructor() {
    this.users = new Map();
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    if (this.isInitialized) return;
    
    try {
      // Check if we have ANY dashboards in the database
      const existingDashboards = await db.select().from(powerBIDashboards);
      
      // Only initialize if the database is completely empty
      if (existingDashboards.length === 0) {
        // Insert only the main dashboard - remove sample data
        const defaultDashboards = [
          {
            name: "Beboerundersøgelse",
            url: "https://app.powerbi.com/reportEmbed?reportId=0772dd9a-24d5-4c64-917e-d50287fcca79&autoAuth=true&ctid=a917771d-94b6-4ac6-8b4f-0d496cfb0e43",
            description: "Analyse af beboertilfredshed og demografi",
            category: "Beboeranalyse",
          }
        ];

        await db.insert(powerBIDashboards).values(defaultDashboards);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
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
    await this.initializeDefaultData();
    const dashboards = await db.select().from(powerBIDashboards).where(eq(powerBIDashboards.isActive, 1));
    return dashboards;
  }

  async getDashboard(id: string): Promise<PowerBIDashboard | null> {
    const [dashboard] = await db.select().from(powerBIDashboards).where(eq(powerBIDashboards.id, id));
    return dashboard || null;
  }

  async createDashboard(dashboard: InsertPowerBIDashboard): Promise<PowerBIDashboard> {
    const [newDashboard] = await db
      .insert(powerBIDashboards)
      .values({
        name: dashboard.name,
        url: dashboard.url,
        description: dashboard.description || null,
        category: dashboard.category || "General",
      })
      .returning();
    return newDashboard;
  }

  async updateDashboard(id: string, dashboard: Partial<InsertPowerBIDashboard>): Promise<PowerBIDashboard | null> {
    const [updatedDashboard] = await db
      .update(powerBIDashboards)
      .set(dashboard)
      .where(eq(powerBIDashboards.id, id))
      .returning();
    return updatedDashboard || null;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const result = await db
      .update(powerBIDashboards)
      .set({ isActive: 0 })
      .where(eq(powerBIDashboards.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllProjects(): Promise<Project[]> {
    const allProjects = await db.select().from(projects);
    return allProjects;
  }

  async getProject(id: string): Promise<Project | null> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || null;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values({
        name: project.name,
        color: project.color || "#9c9387",
        area: project.area || null,
      })
      .returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | null> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSegmentsByProject(projectId: string): Promise<Segment[]> {
    const projectSegments = await db
      .select()
      .from(segments)
      .where(eq(segments.projectId, projectId));
    return projectSegments;
  }

  async getSegment(id: string): Promise<Segment | null> {
    const [segment] = await db.select().from(segments).where(eq(segments.id, id));
    return segment || null;
  }

  async createSegment(segment: InsertSegment): Promise<Segment> {
    const [newSegment] = await db
      .insert(segments)
      .values({
        projectId: segment.projectId,
        label: segment.label,
        startMonth: segment.startMonth,
        endMonth: segment.endMonth,
        description: segment.description || null,
      })
      .returning();
    return newSegment;
  }

  async updateSegment(id: string, segment: Partial<InsertSegment>): Promise<Segment | null> {
    const [updatedSegment] = await db
      .update(segments)
      .set(segment)
      .where(eq(segments.id, id))
      .returning();
    return updatedSegment || null;
  }

  async deleteSegment(id: string): Promise<boolean> {
    const result = await db.delete(segments).where(eq(segments.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();