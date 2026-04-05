import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, productsTable, ordersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { extractUser, mockUsers, useMockDB } from "./auth";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "campusmart-salt").digest("hex");
}

// Get user profile
router.get("/profile", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.params.id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { username, phone, campus, avatarUrl } = req.body;

    if (useMockDB) {
      const existing = mockUsers.get(userId);
      if (!existing) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      
      const updated = {
        ...existing,
        username: username || existing.username,
        phone: phone !== undefined ? phone : existing.phone,
        campus: campus !== undefined ? campus : existing.campus,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
      };
      
      mockUsers.set(userId, updated);
      
      const dbInstance = getLocalDB();
      const uIndex = dbInstance.users.findIndex(u => u.id === userId);
      if (uIndex !== -1) {
        dbInstance.users[uIndex] = updated;
      } else {
        dbInstance.users.push(updated);
      }
      saveLocalDB();
      
      const { passwordHash, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } else {
      const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (!existing) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const [updated] = await db.update(usersTable)
        .set({
          username: username || existing.username,
          phone: phone !== undefined ? phone : existing.phone,
          campus: campus !== undefined ? campus : existing.campus,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
        })
        .where(eq(usersTable.id, userId))
        .returning();

      const { passwordHash, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
router.post("/change-password", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.passwordHash !== hashPassword(currentPassword)) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const [updated] = await db.update(usersTable)
      .set({ passwordHash: hashPassword(newPassword) })
      .where(eq(usersTable.id, userId))
      .returning();

    const { passwordHash, ...userWithoutPassword } = updated;
    res.json({ success: true, message: "Password changed", user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Get user stats (for seller dashboard)
router.get("/stats/seller", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) {
      const dbInstance = getLocalDB();
      const userProducts = dbInstance.products.filter(p => p.sellerId === userId);
      const allOrders = dbInstance.orders || [];
      
      let totalSales = 0;
      let totalEarnings = 0;
      
      allOrders.forEach(order => {
        const sellerItems = order.items.filter((item: any) => item.sellerId === userId);
        if (sellerItems.length > 0) {
          totalSales += sellerItems.length;
          totalEarnings += sellerItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        }
      });

      res.json({
        totalSales,
        totalEarnings,
        totalProducts: userProducts.length,
        averageRating: 4.5, // Mock rating
        totalReviews: 0,
      });
      return;
    }

    // Real DB stats
    const [productsCount] = await db.select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(eq(productsTable.sellerId, userId));

    const orders = await db.select().from(ordersTable);
    
    let totalSales = 0;
    let totalEarnings = 0;

    orders.forEach(order => {
      const items = order.items as any[];
      const sellerItems = items.filter(item => item.sellerId === userId);
      if (sellerItems.length > 0) {
        totalSales += sellerItems.length;
        totalEarnings += sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      }
    });

    res.json({
      totalSales,
      totalEarnings,
      totalProducts: Number(productsCount?.count || 0),
      averageRating: 4.5,
      totalReviews: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Search users
router.get("/search/:query", async (req, res) => {
  try {
    const users = await db.select().from(usersTable)
      .where(eq(usersTable.username, req.params.query))
      .limit(10);

    const filtered = users.map(({ passwordHash, ...user }) => user);
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;
