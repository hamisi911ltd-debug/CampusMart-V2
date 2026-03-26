import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, productsTable, wishlistTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

router.get("/profile", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [listingsCount] = await db.select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(eq(productsTable.sellerId, userId));

    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      campus: user.campus,
      avatarUrl: user.avatarUrl,
      rating: 4.8,
      totalSales: 0,
      totalListings: Number(listingsCount?.count || 0),
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { username, phone, campus, avatarUrl } = req.body;
    const updates: any = {};
    if (username) updates.username = username;
    if (phone) updates.phone = phone;
    if (campus) updates.campus = campus;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const [user] = await db.update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, userId))
      .returning();

    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      campus: user.campus,
      avatarUrl: user.avatarUrl,
      rating: 4.8,
      totalSales: 0,
      totalListings: 0,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/wishlist", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.json([]);
    return;
  }
  try {
    const rows = await db.select({
      product: productsTable,
    }).from(wishlistTable)
      .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
      .where(eq(wishlistTable.userId, userId));

    const products = rows.map(({ product }) => ({
      ...product,
      isWishlisted: true,
    })).filter(p => p.id);

    res.json(products);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

router.post("/wishlist", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { productId } = req.body;
    const existing = await db.select().from(wishlistTable)
      .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(wishlistTable).where(eq(wishlistTable.id, existing[0].id));
      res.json({ wishlisted: false, productId });
    } else {
      await db.insert(wishlistTable).values({
        id: generateId(),
        userId,
        productId,
      });
      res.json({ wishlisted: true, productId });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
});

router.get("/listings", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.sellerId, userId));
    res.json(products);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

export default router;
