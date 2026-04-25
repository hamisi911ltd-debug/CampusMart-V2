import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { extractUser, mockCart } from "./auth";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";

const router: IRouter = Router();

// In-memory cart storage for mock mode
let useMockDB = false;

// Test database connection on startup
(async () => {
  try {
    await db.select().from(cartItemsTable).limit(1);
  } catch (err) {
    useMockDB = true;
  }
})();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function syncMockStorage(userId: string) {
  const dbInstance = getLocalDB();
  // Filter out existing items for this user and replace with current mockCart state
  dbInstance.cartItems = dbInstance.cartItems.filter((i: any) => i.userId !== userId);
  const userCart = mockCart.get(userId) || [];
  // Ensure userId is on every item
  dbInstance.cartItems.push(...userCart.map((i: any) => ({ ...i, userId })));
  saveLocalDB();
}

// Get user's cart
router.get("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) {
      // Use mock storage
      const items = mockCart.get(userId) || [];
      
      // Enhance items with seller information if missing
      const dbInstance = getLocalDB();
      const enhancedItems = items.map((item: any) => {
        if (!item.sellerPhone || !item.sellerUsername) {
          if (item.productId) {
            const product = dbInstance.products.find((p: any) => p.id === item.productId);
            const seller = dbInstance.users.find((u: any) => u.id === product?.sellerId);
            return {
              ...item,
              sellerPhone: seller?.phone || null,
              sellerUsername: seller?.username || "Unknown",
            };
          } else if (item.foodItemId) {
            const foodItem = dbInstance.foodItems.find((f: any) => f.id === item.foodItemId);
            const vendor = dbInstance.foodVendors.find((v: any) => v.id === foodItem?.vendorId);
            return {
              ...item,
              sellerPhone: vendor?.phone || null,
              sellerUsername: vendor?.name || "Unknown Vendor",
            };
          }
        }
        return item;
      });
      
      const total = enhancedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const itemCount = enhancedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      res.json({ items: enhancedItems, total, itemCount });
      return;
    }

    // Get user's cart
    const items = await db.select({
      cartItem: cartItemsTable,
      product: productsTable,
      seller: usersTable,
      foodItem: foodItemsTable,
    }).from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
      .leftJoin(foodItemsTable, eq(cartItemsTable.foodItemId, foodItemsTable.id))
      .where(eq(cartItemsTable.userId, userId));

    const cartItems = items.map(({ cartItem, product, seller, foodItem }: any) => {
      if (foodItem) {
        return {
          id: cartItem.id,
          foodItemId: cartItem.foodItemId,
          quantity: cartItem.quantity,
          title: foodItem.name,
          price: foodItem.price,
          image: foodItem.image,
          type: "food",
        };
      }
      return {
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        title: product?.title || "Unknown Product",
        price: product?.price || 0,
        image: product?.images?.[0] || null,
        sellerUsername: seller?.username || "Unknown",
        sellerId: product?.sellerId || null,
        sellerPhone: seller?.phone || product?.sellerPhone || null,
        type: "product",
      };
    });

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    res.json({ items: cartItems, total, itemCount });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add item to cart
router.post("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { productId, foodItemId, quantity = 1 } = req.body;
    if (!productId && !foodItemId) {
      res.status(400).json({ error: "Product or Food Item ID required" });
      return;
    }

    if (useMockDB) {
      // Use mock storage
      const dbInstance = getLocalDB();
      let itemPrice = 0;
      let itemTitle = "";
      let itemImage = null;
      let sellerPhone = null;
      let sellerUsername = null;

      if (productId) {
        const product = dbInstance.products.find((p: any) => p.id === productId);
        if (!product) return res.status(404).json({ error: "Product not found" });
        
        // Find seller information
        const seller = dbInstance.users.find((u: any) => u.id === product.sellerId);
        
        itemPrice = product.price;
        itemTitle = product.title;
        itemImage = product.images?.[0] || null;
        sellerPhone = seller?.phone || null;
        sellerUsername = seller?.username || "Unknown";
      } else {
        const foodItem = dbInstance.foodItems.find((f: any) => f.id === foodItemId);
        if (!foodItem) return res.status(404).json({ error: "Food item not found" });
        
        // Find vendor information
        const vendor = dbInstance.foodVendors.find((v: any) => v.id === foodItem.vendorId);
        
        itemPrice = foodItem.price;
        itemTitle = foodItem.name;
        itemImage = foodItem.image;
        sellerPhone = vendor?.phone || null;
        sellerUsername = vendor?.name || "Unknown Vendor";
      }

      const userCart = mockCart.get(userId) || [];
      const existing = userCart.find(i => (productId && i.productId === productId) || (foodItemId && i.foodItemId === foodItemId));
      
      if (existing) {
        existing.quantity += Number(quantity);
      } else {
        userCart.push({
          id: generateId(),
          productId: productId || null,
          foodItemId: foodItemId || null,
          quantity: Number(quantity),
          price: itemPrice,
          title: itemTitle,
          image: itemImage,
          sellerPhone: sellerPhone,
          sellerUsername: sellerUsername,
          type: productId ? "product" : "food",
          userId // For flat storage in JSON
        });
      }
      
      mockCart.set(userId, userCart);
      syncMockStorage(userId);
      res.status(201).json({ success: true });
      return;
    }

    // Real DB
    if (productId) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
      if (!product) return res.status(404).json({ error: "Product not found" });

      const [existing] = await db.select().from(cartItemsTable)
        .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

      if (existing) {
        const [updated] = await db.update(cartItemsTable).set({ quantity: existing.quantity + Number(quantity) }).where(eq(cartItemsTable.id, existing.id)).returning();
        res.json(updated);
        return;
      } else {
        const [item] = await db.insert(cartItemsTable).values({ id: generateId(), userId, productId, quantity: Number(quantity) }).returning();
        res.status(201).json(item);
        return;
      }
    } else {
      const [foodItem] = await db.select().from(foodItemsTable).where(eq(foodItemsTable.id, foodItemId));
      if (!foodItem) return res.status(404).json({ error: "Food item not found" });

      const [existing] = await db.select().from(cartItemsTable)
        .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.foodItemId, foodItemId)));

      if (existing) {
        const [updated] = await db.update(cartItemsTable).set({ quantity: existing.quantity + Number(quantity) }).where(eq(cartItemsTable.id, existing.id)).returning();
        res.json(updated);
        return;
      } else {
        const [item] = await db.insert(cartItemsTable).values({ id: generateId(), userId, foodItemId, quantity: Number(quantity) }).returning();
        res.status(201).json(item);
        return;
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
    return;
  }
});

// Update cart item quantity
router.put("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 1) return res.status(400).json({ error: "Invalid quantity" });

    if (useMockDB) {
      const userCart = mockCart.get(userId) || [];
      const item = userCart.find(i => i.id === req.params.id);
      if (item) {
        item.quantity = Number(quantity);
        syncMockStorage(userId);
        res.json(item);
      } else {
        res.status(404).json({ error: "Cart item not found" });
      }
      return;
    }

    const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, req.params.id));
    if (!item || item.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    const [updated] = await db.update(cartItemsTable).set({ quantity: Number(quantity) }).where(eq(cartItemsTable.id, req.params.id)).returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// Remove item from cart
router.delete("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    if (useMockDB) {
      const userCart = mockCart.get(userId) || [];
      const filtered = userCart.filter(i => i.id !== req.params.id);
      mockCart.set(userId, filtered);
      syncMockStorage(userId);
      res.json({ success: true });
      return;
    }
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.id, req.params.id), eq(cartItemsTable.userId, userId)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// Clear cart
router.delete("/", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    if (useMockDB) {
      mockCart.set(userId, []);
      syncMockStorage(userId);
      res.json({ success: true });
      return;
    }
    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
