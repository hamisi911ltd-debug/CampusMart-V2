import { pgTable, text, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const foodVendorsTable = pgTable("food_vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  campus: text("campus").notNull(),
  bannerImage: text("banner_image"),
  rating: real("rating").default(4.0).notNull(),
  deliveryTime: text("delivery_time").default("20-30 min").notNull(),
  minOrder: integer("min_order").default(0).notNull(),
  categories: text("categories").array().default([]).notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foodItemsTable = pgTable("food_items", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  image: text("image"),
  category: text("category").notNull(),
  available: boolean("available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFoodVendorSchema = createInsertSchema(foodVendorsTable).omit({ id: true, createdAt: true });
export const insertFoodItemSchema = createInsertSchema(foodItemsTable).omit({ id: true, createdAt: true });
export type InsertFoodVendor = z.infer<typeof insertFoodVendorSchema>;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodVendor = typeof foodVendorsTable.$inferSelect;
export type FoodItem = typeof foodItemsTable.$inferSelect;
