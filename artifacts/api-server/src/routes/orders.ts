import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function generateOrderId(): string {
  return "ORD-" + Math.floor(100000 + Math.random() * 900000).toString();
}

router.get("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.buyerId, userId))
      .orderBy(desc(ordersTable.createdAt));
    res.json(orders);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    const cartRows = await db.select({
      item: cartItemsTable,
      product: productsTable,
      sellerUsername: usersTable.username,
    }).from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
      .where(eq(cartItemsTable.userId, userId));

    if (cartRows.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const items = cartRows.map(({ item, product, sellerUsername }) => ({
      productId: item.productId,
      title: product?.title || "Unknown",
      price: product?.price || 0,
      quantity: item.quantity,
      image: product?.images?.[0] || null,
      sellerUsername: sellerUsername || "Unknown",
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [order] = await db.insert(ordersTable).values({
      id: generateId(),
      orderId: generateOrderId(),
      buyerId: userId,
      items,
      totalAmount,
      status: "pending",
      deliveryAddress,
    }).returning();

    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

    res.status(201).json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [order] = await db.select().from(ordersTable)
      .where(eq(ordersTable.id, req.params.id))
      .limit(1);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;
