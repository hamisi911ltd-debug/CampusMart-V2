import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, usersTable, wishlistTable } from "@workspace/db";
import { eq, ilike, and, desc, asc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

router.get("/", async (req, res) => {
  try {
    const userId = extractUser(req);
    const { category, campus, search, sort, page = "1", limit = "20", featured } = req.query as any;

    let query = db.select({
      product: productsTable,
      sellerUsername: usersTable.username,
      sellerAvatar: usersTable.avatarUrl,
    }).from(productsTable).leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id));

    const conditions = [eq(productsTable.status, "active")];
    if (category && category !== "all") conditions.push(eq(productsTable.category, category));
    if (campus) conditions.push(eq(productsTable.campus, campus));
    if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
    if (featured === "true") conditions.push(eq(productsTable.featured, true));

    const rows = await query.where(and(...conditions))
      .orderBy(
        sort === "price_asc" ? asc(productsTable.price) :
        sort === "price_desc" ? desc(productsTable.price) :
        desc(productsTable.createdAt)
      )
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    let wishlistedIds: Set<string> = new Set();
    if (userId) {
      const wl = await db.select({ productId: wishlistTable.productId }).from(wishlistTable)
        .where(eq(wishlistTable.userId, userId));
      wishlistedIds = new Set(wl.map(w => w.productId));
    }

    const products = rows.map(({ product, sellerUsername, sellerAvatar }) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      condition: product.condition,
      campus: product.campus,
      images: product.images,
      stock: product.stock,
      status: product.status,
      badge: product.badge,
      sellerId: product.sellerId,
      sellerUsername: sellerUsername || "Unknown",
      sellerAvatar: sellerAvatar,
      sellerRating: 4.5,
      isWishlisted: wishlistedIds.has(product.id),
      createdAt: product.createdAt,
    }));

    const totalRows = await db.select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(and(...conditions));
    const total = Number(totalRows[0]?.count || 0);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { title, description, price, originalPrice, category, condition, campus, images, stock } = req.body;
    const id = generateId();
    const [product] = await db.insert(productsTable).values({
      id,
      sellerId: userId,
      title,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category,
      condition,
      campus,
      images: images || [],
      stock: stock || 1,
      badge: originalPrice && Number(originalPrice) > Number(price) ? "SALE" : "NEW",
    }).returning();
    res.status(201).json(product);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = extractUser(req);
    const [row] = await db.select({
      product: productsTable,
      sellerUsername: usersTable.username,
      sellerAvatar: usersTable.avatarUrl,
    }).from(productsTable)
      .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
      .where(eq(productsTable.id, req.params.id));

    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    let isWishlisted = false;
    if (userId) {
      const wl = await db.select().from(wishlistTable)
        .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, req.params.id)));
      isWishlisted = wl.length > 0;
    }

    res.json({
      ...row.product,
      sellerUsername: row.sellerUsername || "Unknown",
      sellerAvatar: row.sellerAvatar,
      sellerRating: 4.5,
      isWishlisted,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.delete("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    await db.delete(productsTable)
      .where(and(eq(productsTable.id, req.params.id), eq(productsTable.sellerId, userId)));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
