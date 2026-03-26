import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const CATEGORIES = [
  { id: "books", name: "Books", icon: "📚" },
  { id: "electronics", name: "Electronics", icon: "💻" },
  { id: "fashion", name: "Fashion", icon: "👗" },
  { id: "food", name: "Food", icon: "🍔" },
  { id: "nrooms", name: "Nrooms", icon: "🏠" },
  { id: "services", name: "Services", icon: "🔧" },
  { id: "stationery", name: "Stationery", icon: "✏️" },
  { id: "furniture", name: "Furniture", icon: "🛋️" },
  { id: "other", name: "Other", icon: "📦" },
];

router.get("/", async (req, res) => {
  try {
    const counts = await db.select({
      category: productsTable.category,
      count: sql<number>`count(*)`,
    }).from(productsTable)
      .where(eq(productsTable.status, "active"))
      .groupBy(productsTable.category);

    const countMap = new Map(counts.map(c => [c.category, Number(c.count)]));

    const categories = CATEGORIES.map(cat => ({
      ...cat,
      count: countMap.get(cat.id) || 0,
    }));

    res.json(categories);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
