import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

async function buildCartResponse(userId: string) {
  const cartRows = await db.select({
    item: cartItemsTable,
    product: productsTable,
    sellerUsername: usersTable.username,
  }).from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const items = cartRows.map(({ item, product, sellerUsername }) => ({
    id: item.id,
    productId: item.productId,
    title: product?.title || "Unknown",
    price: product?.price || 0,
    image: product?.images?.[0] || null,
    quantity: item.quantity,
    sellerId: product?.sellerId || "",
    sellerUsername: sellerUsername || "Unknown",
  }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, total, itemCount };
}

router.get("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.json({ items: [], total: 0, itemCount: 0 });
    return;
  }
  try {
    const cart = await buildCartResponse(userId);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { productId, quantity } = req.body;
    const existing = await db.select().from(cartItemsTable)
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(cartItemsTable)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItemsTable.id, existing[0].id));
    } else {
      await db.insert(cartItemsTable).values({
        id: generateId(),
        userId,
        productId,
        quantity,
      });
    }

    const cart = await buildCartResponse(userId);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.put("/:itemId", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await db.delete(cartItemsTable)
        .where(and(eq(cartItemsTable.id, req.params.itemId), eq(cartItemsTable.userId, userId)));
    } else {
      await db.update(cartItemsTable)
        .set({ quantity })
        .where(and(eq(cartItemsTable.id, req.params.itemId), eq(cartItemsTable.userId, userId)));
    }
    const cart = await buildCartResponse(userId);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

router.delete("/:itemId", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    await db.delete(cartItemsTable)
      .where(and(eq(cartItemsTable.id, req.params.itemId), eq(cartItemsTable.userId, userId)));
    const cart = await buildCartResponse(userId);
    res.json(cart);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

router.delete("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
