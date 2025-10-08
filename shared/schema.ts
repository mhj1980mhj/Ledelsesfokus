import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const powerBIDashboards = pgTable("power_bi_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: integer("is_active").notNull().default(1),
});


export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPowerBIDashboardSchema = createInsertSchema(powerBIDashboards).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPowerBIDashboard = z.infer<typeof insertPowerBIDashboardSchema>;
export type PowerBIDashboard = typeof powerBIDashboards.$inferSelect;
