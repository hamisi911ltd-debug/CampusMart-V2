import { Router, type IRouter } from "express";
import { eq, ilike, and, desc, asc, sql, notInArray } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";
import { extractUser, useMockDB, mockUsers } from "./auth";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// In-memory store for mock-mode created products linked to laptop mock file
// All test products removed - only user-created products will be shown
function getMockProducts() {
  return getLocalDB().products as any[];
}


// Get all products with filters
router.get("/", async (req, res) => {
  try {
    const userId = extractUser(req);
    const { category, campus, search, sort, page = "1", limit = "20", featured, excludeCategories } = req.query as any;

    try {
      if (useMockDB) throw new Error("Mock DB active");
      let query = db.select({
        product: productsTable,
        sellerUsername: usersTable.username,
        sellerAvatar: usersTable.avatarUrl,
        sellerPhone: usersTable.phone,
      }).from(productsTable).leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id));

      const conditions = [eq(productsTable.status, "active")];
      if (category && category !== "all") conditions.push(eq(productsTable.category, category));
      if (campus) conditions.push(eq(productsTable.campus, campus));
      if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
      if (featured === "true") conditions.push(eq(productsTable.featured, true));
      if (excludeCategories) {
        conditions.push(notInArray(productsTable.category, excludeCategories.split(",")));
      }

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

      const products = rows.map(({ product, sellerUsername, sellerAvatar, sellerPhone }) => ({
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
        sellerPhone: sellerPhone,
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
    } catch (dbErr) {
      // Use mock data if database fails
      try {
        let filtered = [...getMockProducts()];

        console.log(`📦 Fetching products (mock) | Total in storage: ${filtered.length}`);

        filtered = filtered.filter(p => p.status === "active");

        console.log(`✓ Active products: ${filtered.length}`);

        if (category && category !== "all") {
          filtered = filtered.filter(p => p.category === category);
        }
        if (campus) {
          filtered = filtered.filter(p => p.campus === campus);
        }
        if (search) {
          filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (featured === "true") {
          filtered = filtered.filter(p => (p as any).featured);
        }
        if (excludeCategories) {
          const excludeList = excludeCategories.split(",");
          filtered = filtered.filter(p => !excludeList.includes(p.category));
        }

        // Safe date parser — handles both Date objects and ISO strings from JSON
        const getTime = (d: any): number => {
          if (!d) return 0;
          if (d instanceof Date) return d.getTime();
          return new Date(d).getTime();
        };

        if (sort === "price_asc") {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sort === "price_desc") {
          filtered.sort((a, b) => b.price - a.price);
        } else {
          filtered.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const start = (pageNum - 1) * limitNum;
        const end = start + limitNum;
        const paginatedProducts = filtered.slice(start, end).map(p => {
          const sellerUser = mockUsers.get(p.sellerId);
          return {
            ...p,
            sellerUsername: sellerUser ? sellerUser.username : p.sellerUsername,
            sellerPhone: sellerUser ? sellerUser.phone : p.sellerPhone
          };
        });

        res.json({
          products: paginatedProducts,
          total: filtered.length,
          page: pageNum,
          totalPages: Math.ceil(filtered.length / limitNum),
        });
      } catch (mockErr: any) {
        console.error("❌ Mock products fallback error:", mockErr?.message, mockErr?.stack);
        res.status(500).json({
          error: "Failed to fetch products",
          detail: process.env.NODE_ENV === "development" ? mockErr?.message : undefined,
        });
      }
    }
  } catch (err: any) {
    console.error("❌ Products route error:", err?.message, err?.stack);
    res.status(500).json({
      error: "Failed to fetch products",
      detail: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
});

// Create a new product
router.post("/", async (req, res) => {
  let userId = extractUser(req);
  
  // For demo/testing: allow posting without auth, assign temp user
  if (!userId) {
    userId = "temp-user-" + Math.random().toString(36).substr(2, 9);
    console.log("⚠️  No auth provided, using temp userId:", userId);
  }
  
  try {
    const { title, description, price, originalPrice, category, condition, campus, images, stock } = req.body;
    
    if (!title || !price || !category || !condition || !campus) {
      console.error("❌ Missing fields:", { title, price, category, condition, campus });
      return res.status(400).json({ error: "Missing required fields: title, price, category, condition, campus" });
    }

    console.log(`📝 Creating product: "${title}" | Price: ${price} | Category: ${category}`);

    const id = generateId();
    try {
      if (useMockDB) throw new Error("Mock DB active");
      const [product] = await db.insert(productsTable).values({
        id,
        sellerId: userId,
        title,
        description: description || null,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        category,
        condition,
        campus,
        images: images || [],
        stock: stock || 1,
        badge: originalPrice && Number(originalPrice) > Number(price) ? "SALE" : "NEW",
      }).returning();
      console.log(`✅ Product created (DB): "${title}" | ID: ${id}`);
      return res.status(201).json(product);
    } catch (dbErr) {
      // Mock fallback — store in memory and JSON file
      console.log(`💾 Using mock storage for product: "${title}"`);
      const currentUser = mockUsers.get(userId);
      
      const mockProduct: any = {
        id,
        title,
        description: description || "",
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null as any,
        category,
        condition,
        campus,
        images: images || [],
        stock: stock || 1,
        status: "active",
        badge: originalPrice && Number(originalPrice) > Number(price) ? "SALE" : "NEW",
        featured: true,
        sellerId: userId,
        sellerUsername: currentUser ? currentUser.username : "you",
        sellerAvatar: currentUser ? currentUser.avatarUrl : null,
        sellerPhone: currentUser ? currentUser.phone : null, // Store actual phone or null
        sellerRating: 5.0,
        isWishlisted: false,
        createdAt: new Date().toISOString(),
      };
      dbInstance.products.unshift(mockProduct);
      saveLocalDB();
      
      console.log(`✅ Product created (mock): "${title}" | Total products: ${dbInstance.products.length}`);
      console.log("📤 Response body:", JSON.stringify(mockProduct));
      
      // Explicitly set headers and send JSON to ensure response body is sent
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const jsonBody = JSON.stringify(mockProduct);
      console.log("📤 JSON string length:", jsonBody.length);
      res.status(201).send(jsonBody);
      return;
    }
  } catch (err: any) {
    console.error("❌ Product creation error:", err?.message || err);
    return res.status(500).json({ error: "Failed to create product", message: err?.message });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = extractUser(req);
    
    try {
      if (useMockDB) throw new Error("Mock DB active");
      const [row] = await db.select({
        product: productsTable,
        sellerUsername: usersTable.username,
        sellerAvatar: usersTable.avatarUrl,
        sellerPhone: usersTable.phone,
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
        sellerPhone: row.sellerPhone,
        sellerRating: 4.5,
        isWishlisted,
      });
    } catch (dbErr) {
      // Use mock data if database fails
      const product = getMockProducts().find(p => p.id === req.params.id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      const sellerUser = mockUsers.get(product.sellerId);
      
      res.json({
        ...product,
        sellerUsername: sellerUser ? sellerUser.username : product.sellerUsername,
        sellerPhone: sellerUser ? sellerUser.phone : product.sellerPhone
      });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { title, description, price, originalPrice, category, condition, campus, images, stock, status } = req.body;
    if (useMockDB) throw new Error("Mock DB active");
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id));
    if (!existing || existing.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [updated] = await db.update(productsTable)
      .set({
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        price: price ? Number(price) : existing.price,
        originalPrice: originalPrice ? Number(originalPrice) : existing.originalPrice,
        category: category || existing.category,
        condition: condition || existing.condition,
        campus: campus || existing.campus,
        images: images || existing.images,
        stock: stock ? Number(stock) : existing.stock,
        status: status || existing.status,
      })
      .where(eq(productsTable.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  const userId = extractUser(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (useMockDB) throw new Error("Mock DB active");
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id));
    if (!existing || existing.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Get seller's products
router.get("/seller/:sellerId", async (req, res) => {
  try {
    if (useMockDB) throw new Error("Mock DB active");
    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.sellerId, req.params.sellerId), eq(productsTable.status, "active")));
    res.json(products);
  } catch (err) {
    if (useMockDB || (err as any).message === "Mock DB active") {
      const products = getLocalDB().products.filter((p: any) => p.sellerId === req.params.sellerId && p.status === "active");
      res.json(products);
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch seller products" });
  }
});

export default router;
