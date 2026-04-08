import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cartItemsTable = pgTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: text("product_id"),
  foodItemId: text("food_item_id"),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlistTable = pgTable("wishlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: text("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true, createdAt: true });
export const insertWishlistSchema = createInsertSchema(wishlistTable).omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;
export type WishlistItem = typeof wishlistTable.$inferSelect;
