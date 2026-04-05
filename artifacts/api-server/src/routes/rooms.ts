import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { roomsTable, usersTable } from "@workspace/db";
import { eq, ilike, and, desc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser, useMockDB } from "./auth";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}



// Get all rooms
router.get("/", async (req, res) => {
  try {
    const { campus, type, search, sort, page = "1", limit = "20" } = req.query as any;

    try {
      if (useMockDB) throw new Error("Mock DB active");
      let query = db.select({
        room: roomsTable,
        landlordName: usersTable.username,
        landlordAvatar: usersTable.avatarUrl,
      }).from(roomsTable)
        .leftJoin(usersTable, eq(roomsTable.landlordId, usersTable.id));

      const conditions = [eq(roomsTable.available, true)];
      if (campus) conditions.push(eq(roomsTable.campus, campus));
      if (type) conditions.push(eq(roomsTable.type, type));
      if (search) conditions.push(ilike(roomsTable.title, `%${search}%`));

      const rows = await query.where(and(...conditions))
        .orderBy(
          sort === "price_asc" ? desc(roomsTable.monthlyRent) :
          sort === "price_desc" ? desc(roomsTable.monthlyRent) :
          desc(roomsTable.createdAt)
        )
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      const rooms = rows.map(({ room, landlordName, landlordAvatar }: any) => ({
        ...room,
        landlordName: landlordName || "Unknown",
        landlordAvatar,
      }));

      const totalRows = await db.select({ count: sql<number>`count(*)` })
        .from(roomsTable)
        .where(and(...conditions));
      const total = Number(totalRows[0]?.count || 0);

      res.json({
        rooms,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (dbErr) {
      const dbInstance = getLocalDB();
      let rooms = [...dbInstance.rooms].filter((r: any) => r.available !== false);

      if (campus) rooms = rooms.filter((r: any) => r.campus === campus);
      if (type) rooms = rooms.filter((r: any) => r.type === type);
      if (search) rooms = rooms.filter((r: any) => r.title.toLowerCase().includes(search.toLowerCase()));

      rooms.sort((a, b) => {
        if (sort === "price_asc") return a.monthlyRent - b.monthlyRent;
        if (sort === "price_desc") return b.monthlyRent - a.monthlyRent;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      const total = rooms.length;
      rooms = rooms.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

      // Mock user lookup for landlords
      rooms = rooms.map(room => {
        const landlord = dbInstance.users.find((u: any) => u.id === room.landlordId);
        return {
          ...room,
          landlordName: landlord?.username || "Unknown",
          landlordAvatar: landlord?.avatarUrl || null,
        };
      });

      res.json({
        rooms,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Create room listing
router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { title, description, type, monthlyRent, campus, distanceToCampus, images, amenities, landlordPhone } = req.body;
    if (!title || !type || !monthlyRent || !campus) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const id = generateId();
    if (useMockDB) throw new Error("Mock DB active");
    const [room] = await db.insert(roomsTable).values({
      id,
      landlordId: userId,
      title,
      description: description || null,
      type,
      monthlyRent: Number(monthlyRent),
      campus,
      distanceToCampus: distanceToCampus || null,
      images: images || [],
      amenities: amenities || [],
      landlordPhone: landlordPhone || null,
    }).returning();

    res.status(201).json(room);
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const { title, description, type, monthlyRent, campus, distanceToCampus, images, amenities, landlordPhone } = req.body;
      const room = {
        id: generateId(), landlordId: userId, title, description, type, monthlyRent: Number(monthlyRent),
        campus, distanceToCampus, images: images || [], amenities: amenities || [],
        landlordPhone, available: true, createdAt: new Date()
      };
      const dbInstance = getLocalDB();
      dbInstance.rooms.push(room);
      saveLocalDB();
      res.status(201).json(room);
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to create room listing" });
  }
});

// Get room by ID
router.get("/:id", async (req, res) => {
  try {
    try {
      if (useMockDB) throw new Error("Mock DB active");
      const [row] = await db.select({
        room: roomsTable,
        landlordName: usersTable.username,
        landlordAvatar: usersTable.avatarUrl,
      }).from(roomsTable)
        .leftJoin(usersTable, eq(roomsTable.landlordId, usersTable.id))
        .where(eq(roomsTable.id, req.params.id));

      if (!row) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      res.json({
        ...row.room,
        landlordName: row.landlordName || "Unknown",
        landlordAvatar: row.landlordAvatar,
      });
    } catch (dbErr) {
      const dbInstance = getLocalDB();
      const room = dbInstance.rooms.find((r: any) => r.id === req.params.id);
      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      const landlord = dbInstance.users.find((u: any) => u.id === room.landlordId);
      res.json({
        ...room,
        landlordName: landlord?.username || "Unknown",
        landlordAvatar: landlord?.avatarUrl || null,
      });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// Update room
router.put("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { title, description, type, monthlyRent, campus, distanceToCampus, images, amenities, landlordPhone, available } = req.body;

    if (useMockDB) throw new Error("Mock DB active");
    const [existing] = await db.select().from(roomsTable).where(eq(roomsTable.id, req.params.id));
    if (!existing || existing.landlordId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [updated] = await db.update(roomsTable)
      .set({
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        type: type || existing.type,
        monthlyRent: monthlyRent ? Number(monthlyRent) : existing.monthlyRent,
        campus: campus || existing.campus,
        distanceToCampus: distanceToCampus !== undefined ? distanceToCampus : existing.distanceToCampus,
        images: images || existing.images,
        amenities: amenities || existing.amenities,
        landlordPhone: landlordPhone !== undefined ? landlordPhone : existing.landlordPhone,
        available: available !== undefined ? available : existing.available,
      })
      .where(eq(roomsTable.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const dbInstance = getLocalDB();
      const idx = dbInstance.rooms.findIndex(r => r.id === req.params.id);
      if (idx !== -1 && dbInstance.rooms[idx].landlordId === userId) {
        dbInstance.rooms[idx] = { ...dbInstance.rooms[idx], ...req.body };
        saveLocalDB();
        res.json(dbInstance.rooms[idx]);
        return;
      }
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// Delete room
router.delete("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) throw new Error("Mock DB active");
    const [existing] = await db.select().from(roomsTable).where(eq(roomsTable.id, req.params.id));
    if (!existing || existing.landlordId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(roomsTable).where(eq(roomsTable.id, req.params.id));
    res.json({ success: true, message: "Room deleted" });
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const dbInstance = getLocalDB();
      const idx = dbInstance.rooms.findIndex(r => r.id === req.params.id && r.landlordId === userId);
      if (idx !== -1) {
        dbInstance.rooms.splice(idx, 1);
        saveLocalDB();
        res.json({ success: true, message: "Room deleted" });
        return;
      }
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

// Get landlord's rooms
router.get("/landlord/:landlordId", async (req, res) => {
  try {
    try {
      if (useMockDB) throw new Error("Mock DB active");
      const rooms = await db.select().from(roomsTable)
        .where(eq(roomsTable.landlordId, req.params.landlordId));
      res.json(rooms);
    } catch (dbErr) {
      const dbInstance = getLocalDB();
      const rooms = dbInstance.rooms.filter((r: any) => r.landlordId === req.params.landlordId);
      res.json(rooms);
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch landlord rooms" });
  }
});

export default router;
