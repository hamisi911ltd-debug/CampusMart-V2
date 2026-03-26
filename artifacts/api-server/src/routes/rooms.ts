import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { roomsTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

router.get("/", async (req, res) => {
  try {
    const { type, campus, minPrice, maxPrice } = req.query as any;

    const conditions = [];
    if (type && type !== "all") conditions.push(eq(roomsTable.type, type));
    if (campus) conditions.push(eq(roomsTable.campus, campus));
    if (minPrice) conditions.push(gte(roomsTable.monthlyRent, Number(minPrice)));
    if (maxPrice) conditions.push(lte(roomsTable.monthlyRent, Number(maxPrice)));

    const rows = await db.select({
      room: roomsTable,
      landlordName: usersTable.username,
    }).from(roomsTable)
      .leftJoin(usersTable, eq(roomsTable.landlordId, usersTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const rooms = rows.map(({ room, landlordName }) => ({
      id: room.id,
      title: room.title,
      description: room.description,
      type: room.type,
      monthlyRent: room.monthlyRent,
      campus: room.campus,
      distanceToCampus: room.distanceToCampus,
      images: room.images,
      amenities: room.amenities,
      available: room.available,
      landlordName: landlordName || "Landlord",
      landlordPhone: room.landlordPhone,
      createdAt: room.createdAt,
    }));

    res.json(rooms);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { title, description, type, monthlyRent, campus, distanceToCampus, images, amenities, landlordPhone } = req.body;
    const [room] = await db.insert(roomsTable).values({
      id: generateId(),
      landlordId: userId,
      title,
      description,
      type,
      monthlyRent: Number(monthlyRent),
      campus,
      distanceToCampus,
      images: images || [],
      amenities: amenities || [],
      landlordPhone,
    }).returning();
    res.status(201).json(room);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db.select({
      room: roomsTable,
      landlordName: usersTable.username,
    }).from(roomsTable)
      .leftJoin(usersTable, eq(roomsTable.landlordId, usersTable.id))
      .where(eq(roomsTable.id, req.params.id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json({
      ...row.room,
      landlordName: row.landlordName || "Landlord",
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

export default router;
