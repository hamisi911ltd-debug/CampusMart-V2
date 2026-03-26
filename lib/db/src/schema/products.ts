import { pgTable, text, integer, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const conditionEnum = pgEnum("condition", ["new", "like_new", "good", "fair"]);
export const productStatusEnum = pgEnum("product_status", ["active", "sold", "paused"]);
export const productBadgeEnum = pgEnum("product_badge", ["HOT", "NEW", "SALE"]);

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  category: text("category").notNull(),
  condition: conditionEnum("condition").notNull(),
  campus: text("campus").notNull(),
  images: text("images").array().default([]).notNull(),
  stock: integer("stock").default(1).notNull(),
  status: productStatusEnum("status").default("active").notNull(),
  badge: productBadgeEnum("badge"),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
