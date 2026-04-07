import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wishlistTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser, useMockDB } from "./auth";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// In-memory wishlist for mock mode
const mockWishlist = new Map<string, string[]>(); // userId -> productId[]

// Seed from local DB
const _db = getLocalDB() as any;
if (_db.wishlist) {
  (_db.wishlist as any[]).forEach((w: any) => {
    const list = mockWishlist.get(w.userId) || [];
    list.push(w.productId);
    mockWishlist.set(w.userId, list);
  });
}

// Get all categories
router.get("/", (_req, res) => {
  res.json([
    { id: "books", name: "Books", icon: "📚" },
    { id: "electronics", name: "Electronics", icon: "💻" },
    { id: "fashion", name: "Fashion", icon: "👕" },
    { id: "food", name: "Food", icon: "🍕" },
    { id: "stationery", name: "Stationery", icon: "✏️" },
    { id: "nrooms", name: "Rooms", icon: "🏠" },
  ]);
});

// Get wishlist
router.get("/wishlist", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    if (useMockDB) {
      const productIds = mockWishlist.get(userId) || [];
      const dbInstance = getLocalDB();
      const products = dbInstance.products
        .filter((p: any) => productIds.includes(p.id))
        .map((p: any) => ({ ...p, isWishlisted: true }));
      res.json({ products, total: products.length });
      return;
    }

    const items = await db.select({ wishlist: wishlistTable, product: productsTable })
      .from(wishlistTable)
      .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
      .where(eq(wishlistTable.userId, userId));

    const products = items.map(({ product }) => product ? { ...product, isWishlisted: true } : null).filter(Boolean);
    res.json({ products, total: products.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// Toggle wishlist (add if not present, remove if present)
router.post("/wishlist/add", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const { productId } = req.body;
    if (!productId) { res.status(400).json({ error: "Product ID required" }); return; }

    if (useMockDB) {
      const list = mockWishlist.get(userId) || [];
      const idx = list.indexOf(productId);
      let wishlisted: boolean;
      if (idx !== -1) {
        list.splice(idx, 1);
        wishlisted = false;
      } else {
        list.push(productId);
        wishlisted = true;
      }
      mockWishlist.set(userId, list);
      // Persist
      const dbInstance = getLocalDB() as any;
      if (!dbInstance.wishlist) dbInstance.wishlist = [];
      dbInstance.wishlist = dbInstance.wishlist.filter((w: any) => !(w.userId === userId && w.productId === productId));
      if (wishlisted) dbInstance.wishlist.push({ id: generateId(), userId, productId });
      saveLocalDB();
      res.json({ wishlisted, productId });
      return;
    }

    const [existing] = await db.select().from(wishlistTable)
      .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));

    if (existing) {
      await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
      res.json({ wishlisted: false, productId });
    } else {
      const id = generateId();
      await db.insert(wishlistTable).values({ id, userId, productId });
      res.json({ wishlisted: true, productId });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to toggle wishlist" });
  }
});

// Remove from wishlist
router.delete("/wishlist/:productId", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    if (useMockDB) {
      const list = mockWishlist.get(userId) || [];
      mockWishlist.set(userId, list.filter(id => id !== req.params.productId));
      const dbInstance = getLocalDB() as any;
      if (dbInstance.wishlist) {
        dbInstance.wishlist = dbInstance.wishlist.filter((w: any) => !(w.userId === userId && w.productId === req.params.productId));
        saveLocalDB();
      }
      res.json({ success: true }); return;
    }
    await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, req.params.productId)));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

export default router;
