import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { foodVendorsTable, foodItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/vendors", async (req, res) => {
  try {
    const { campus } = req.query as any;
    const conditions = campus ? [eq(foodVendorsTable.campus, campus)] : [];
    const vendors = await db.select().from(foodVendorsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    res.json(vendors);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

router.get("/items", async (req, res) => {
  try {
    const { vendorId, category, campus } = req.query as any;

    const rows = await db.select({
      item: foodItemsTable,
      vendorName: foodVendorsTable.name,
      vendorCampus: foodVendorsTable.campus,
    }).from(foodItemsTable)
      .leftJoin(foodVendorsTable, eq(foodItemsTable.vendorId, foodVendorsTable.id));

    const filtered = rows.filter(({ item, vendorCampus }) => {
      if (vendorId && item.vendorId !== vendorId) return false;
      if (category && item.category !== category) return false;
      if (campus && vendorCampus !== campus) return false;
      return true;
    });

    const items = filtered.map(({ item, vendorName, vendorCampus }) => ({
      id: item.id,
      vendorId: item.vendorId,
      vendorName: vendorName || "Unknown",
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      available: item.available,
      campus: vendorCampus || "",
    }));

    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

export default router;
