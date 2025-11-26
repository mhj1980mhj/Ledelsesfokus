import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const areas = pgTable("areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const powerBIDashboards = pgTable("power_bi_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  type: text("type").notNull().default("power-bi"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: integer("is_active").notNull().default(1),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull().default("#9c9387"),
  area: text("area"),
  ansvarlig: varchar("ansvarlig", { length: 3 }).notNull(),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const segments = pgTable("segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  startMonth: integer("start_month").notNull(),
  endMonth: integer("end_month").notNull(),
  description: text("description"),
});


export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAreaSchema = createInsertSchema(areas).omit({
  id: true,
});

export const insertPowerBIDashboardSchema = createInsertSchema(powerBIDashboards).omit({
  id: true,
  createdAt: true,
  isActive: true,
}).extend({
  type: z.enum(["power-bi", "microsoft-lists", "sharepoint-folder"]).default("power-bi"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  position: true,
}).extend({
  ansvarlig: z.string().min(1, "Ansvarlig skal være mindst 1 tegn").max(3, "Ansvarlig må højst være 3 tegn"),
});

export const insertSegmentSchema = createInsertSchema(segments).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertArea = z.infer<typeof insertAreaSchema>;
export type Area = typeof areas.$inferSelect;
export type InsertPowerBIDashboard = z.infer<typeof insertPowerBIDashboardSchema>;
export type PowerBIDashboard = typeof powerBIDashboards.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertSegment = z.infer<typeof insertSegmentSchema>;
export type Segment = typeof segments.$inferSelect;
