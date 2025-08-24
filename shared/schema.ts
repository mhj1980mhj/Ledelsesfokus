import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const dashboardStats = pgTable("dashboard_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalUnits: integer("total_units").notNull().default(0),
  occupancyRate: text("occupancy_rate").notNull().default("0%"),
  monthlyRevenue: text("monthly_revenue").notNull().default("0 kr"),
  activeCases: integer("active_cases").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDashboardStatsSchema = createInsertSchema(dashboardStats).pick({
  totalUnits: true,
  occupancyRate: true,
  monthlyRevenue: true,
  activeCases: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDashboardStats = z.infer<typeof insertDashboardStatsSchema>;
export type DashboardStats = typeof dashboardStats.$inferSelect;
