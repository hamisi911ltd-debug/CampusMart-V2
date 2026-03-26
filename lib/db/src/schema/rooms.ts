import { pgTable, text, integer, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomTypeEnum = pgEnum("room_type", ["bedsitter", "single", "one_bedroom", "two_bedroom", "hostel"]);

export const roomsTable = pgTable("rooms", {
  id: text("id").primaryKey(),
  landlordId: text("landlord_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: roomTypeEnum("type").notNull(),
  monthlyRent: integer("monthly_rent").notNull(),
  campus: text("campus").notNull(),
  distanceToCampus: text("distance_to_campus"),
  images: text("images").array().default([]).notNull(),
  amenities: text("amenities").array().default([]).notNull(),
  available: boolean("available").default(true).notNull(),
  landlordPhone: text("landlord_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({ id: true, createdAt: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
