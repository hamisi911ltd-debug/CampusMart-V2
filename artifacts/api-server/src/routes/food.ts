import { Router, type IRouter } from "express";
import { eq, ilike, and, desc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser, useMockDB } from "./auth";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Get all food vendors
router.get("/vendors", async (req, res) => {
  try {
    const { campus, search, page = "1", limit = "20" } = req.query as any;

    try {
      if (useMockDB) throw new Error("Mock DB active");
      let query = db.select().from(foodVendorsTable);

      const conditions = [eq(foodVendorsTable.isOpen, true)];
      if (campus) conditions.push(eq(foodVendorsTable.campus, campus));
      if (search) conditions.push(ilike(foodVendorsTable.name, `%${search}%`));

      const vendors = await query.where(and(...conditions))
        .orderBy(desc(foodVendorsTable.rating))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      const totalRows = await db.select({ count: sql<number>`count(*)` })
        .from(foodVendorsTable)
        .where(and(...conditions));
      const total = Number(totalRows[0]?.count || 0);

      res.json({
        vendors,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (dbErr) {
      const dbInstance = getLocalDB();
      let vendors = [...dbInstance.foodVendors].filter(v => v.isOpen);
      if (campus) vendors = vendors.filter(v => v.campus === campus);
      if (search) vendors = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
      
      vendors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      const total = vendors.length;
      vendors = vendors.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));
      
      res.json({
        vendors,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// Get vendor by ID
router.get("/vendors/:id", async (req, res) => {
  try {
    try {
      if (useMockDB) throw new Error("Mock DB active");
      const [vendor] = await db.select().from(foodVendorsTable)
        .where(eq(foodVendorsTable.id, req.params.id));

      if (!vendor) {
        res.status(404).json({ error: "Vendor not found" });
        return;
      }

      const items = await db.select().from(foodItemsTable)
        .where(eq(foodItemsTable.vendorId, vendor.id));

      res.json({ ...vendor, items });
    } catch (dbErr) {
      const dbInstance = getLocalDB();
      const vendor = dbInstance.foodVendors.find((v: any) => v.id === req.params.id);
      if (!vendor) {
        res.status(404).json({ error: "Vendor not found" });
        return;
      }
      const items = dbInstance.foodItems.filter((i: any) => i.vendorId === vendor.id);
      res.json({ ...vendor, items });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

// Create food vendor
router.post("/vendors", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { name, campus, bannerImage, deliveryTime, minOrder, categories } = req.body;
    if (!name || !campus) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const id = generateId();
    if (useMockDB) throw new Error("Mock DB active");
    const [vendor] = await db.insert(foodVendorsTable).values({
      id,
      name,
      campus,
      bannerImage: bannerImage || null,
      deliveryTime: deliveryTime || "20-30 min",
      minOrder: minOrder || 0,
      categories: categories || [],
    }).returning();

    res.status(201).json(vendor);
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const { name, campus, bannerImage, deliveryTime, minOrder, categories } = req.body;
      const vendor = {
        id: generateId(), name, campus, bannerImage: bannerImage || null,
        deliveryTime: deliveryTime || "20-30 min", minOrder: minOrder || 0,
        categories: categories || [], isOpen: true, rating: 0, createdAt: new Date()
      };
      const dbInstance = getLocalDB();
      dbInstance.foodVendors.push(vendor);
      saveLocalDB();
      res.status(201).json(vendor);
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

// Get food items by vendor
router.get("/items/vendor/:vendorId", async (req, res) => {
  try {
    try {
      if (useMockDB) throw new Error("Mock DB active");
      const items = await db.select().from(foodItemsTable)
        .where(and(eq(foodItemsTable.vendorId, req.params.vendorId), eq(foodItemsTable.available, true)));
      res.json(items);
    } catch (dbErr) {
      const dbInstance = getLocalDB();
      const items = dbInstance.foodItems.filter((i: any) => i.vendorId === req.params.vendorId && i.available);
      res.json(items);
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Create food item
router.post("/items", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { vendorId, name, description, price, image, category } = req.body;
    if (!vendorId || !name || !price || !category) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const id = generateId();
    if (useMockDB) throw new Error("Mock DB active");
    const [item] = await db.insert(foodItemsTable).values({
      id,
      vendorId,
      name,
      description: description || null,
      price: Number(price),
      image: image || null,
      category,
    }).returning();

    res.status(201).json(item);
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const { vendorId, name, description, price, image, category } = req.body;
      const item = {
        id: generateId(), vendorId, name, description: description || null,
        price: Number(price), image: image || null, category, available: true, createdAt: new Date()
      };
      const dbInstance = getLocalDB();
      dbInstance.foodItems.push(item);
      saveLocalDB();
      res.status(201).json(item);
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to create food item" });
  }
});

// Update food item
router.put("/items/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { name, description, price, image, category, available } = req.body;

    if (useMockDB) throw new Error("Mock DB active");
    const [existing] = await db.select().from(foodItemsTable).where(eq(foodItemsTable.id, req.params.id));
    if (!existing) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const [updated] = await db.update(foodItemsTable)
      .set({
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        price: price ? Number(price) : existing.price,
        image: image !== undefined ? image : existing.image,
        category: category || existing.category,
        available: available !== undefined ? available : existing.available,
      })
      .where(eq(foodItemsTable.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const dbInstance = getLocalDB();
      const idx = dbInstance.foodItems.findIndex(i => i.id === req.params.id);
      if (idx !== -1) {
        dbInstance.foodItems[idx] = { ...dbInstance.foodItems[idx], ...req.body };
        saveLocalDB();
        res.json(dbInstance.foodItems[idx]);
        return;
      }
      res.status(404).json({ error: "Item not found" });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Delete food item
router.delete("/items/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) throw new Error("Mock DB active");
    await db.delete(foodItemsTable).where(eq(foodItemsTable.id, req.params.id));
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const dbInstance = getLocalDB();
      const idx = dbInstance.foodItems.findIndex(i => i.id === req.params.id);
      if (idx !== -1) {
        dbInstance.foodItems.splice(idx, 1);
        saveLocalDB();
        res.json({ success: true, message: "Item deleted" });
        return;
      }
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
