import { Router, type IRouter } from "express";
import { extractUser, mockUsers, useMockDB } from "./auth";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Middleware: admin only
function requireAdmin(req: any, res: any, next: any) {
  const userId = extractUser(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  // Check mock users first
  const mockUser = mockUsers.get(userId);
  if (mockUser) {
    if (mockUser.role !== "admin") { res.status(403).json({ error: "Admin access required" }); return; }
    req.adminId = userId;
    return next();
  }
  // If no mock user found, deny
  res.status(403).json({ error: "Admin access required" });
}

// ── Dashboard stats ──────────────────────────────────────────────────────────
router.get("/stats", requireAdmin, (req, res) => {
  const db = getLocalDB();
  const users = [...mockUsers.values()];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newUsersThisWeek = users.filter(u => new Date(u.createdAt) > weekAgo).length;
  const newProductsThisWeek = db.products.filter(p => new Date(p.createdAt) > weekAgo).length;
  const pendingProducts = db.products.filter(p => p.status === "pending").length;
  const activeProducts = db.products.filter(p => p.status === "active").length;
  const totalRevenue = db.orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const revenueThisMonth = db.orders
    .filter((o: any) => new Date(o.createdAt) > monthAgo)
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  db.products.forEach((p: any) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });

  // Orders by status
  const orderStatus: Record<string, number> = {};
  db.orders.forEach((o: any) => {
    orderStatus[o.status] = (orderStatus[o.status] || 0) + 1;
  });

  // Recent activity (last 10 products + users combined)
  const recentProducts = [...db.products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(p => ({ type: "product", id: p.id, title: p.title, status: p.status, createdAt: p.createdAt }));

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(u => ({ type: "user", id: u.id, title: u.username, status: u.role, createdAt: u.createdAt }));

  const recentActivity = [...recentProducts, ...recentUsers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  res.json({
    totals: {
      users: users.length,
      products: db.products.length,
      rooms: db.rooms.length,
      foodVendors: db.foodVendors.length,
      orders: db.orders.length,
      revenue: totalRevenue,
    },
    weekly: { newUsers: newUsersThisWeek, newProducts: newProductsThisWeek },
    monthly: { revenue: revenueThisMonth },
    products: { pending: pendingProducts, active: activeProducts },
    categoryBreakdown: Object.entries(categoryMap).map(([name, count]) => ({ name, count })),
    orderStatus: Object.entries(orderStatus).map(([status, count]) => ({ status, count })),
    recentActivity,
  });
});

// ── Users ────────────────────────────────────────────────────────────────────
router.get("/users", requireAdmin, (req, res) => {
  const { search, role, page = "1", limit = "20" } = req.query as any;
  let users = [...mockUsers.values()].map(({ passwordHash, ...u }) => u);

  if (search) users = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  if (role) users = users.filter(u => u.role === role);

  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pageNum = Number(page), limitNum = Number(limit);
  const total = users.length;
  const paginated = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ users: paginated, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.put("/users/:id/role", requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!["student", "admin"].includes(role)) { res.status(400).json({ error: "Invalid role" }); return; }
  const user = mockUsers.get(req.params.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  user.role = role;
  const db = getLocalDB();
  const idx = db.users.findIndex((u: any) => u.id === req.params.id);
  if (idx !== -1) { db.users[idx].role = role; saveLocalDB(); }
  res.json({ success: true, role });
});

router.delete("/users/:id", requireAdmin, (req, res) => {
  const adminId = (req as any).adminId;
  if (req.params.id === adminId) { res.status(400).json({ error: "Cannot delete yourself" }); return; }
  mockUsers.delete(req.params.id);
  const db = getLocalDB();
  db.users = db.users.filter((u: any) => u.id !== req.params.id);
  db.products = db.products.filter((p: any) => p.sellerId !== req.params.id);
  saveLocalDB();
  res.json({ success: true });
});

// ── Products ─────────────────────────────────────────────────────────────────
router.get("/products", requireAdmin, (req, res) => {
  const { search, status, category, page = "1", limit = "20" } = req.query as any;
  const db = getLocalDB();
  let products = [...db.products];

  if (search) products = products.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
  if (status) products = products.filter(p => p.status === status);
  if (category) products = products.filter(p => p.category === category);

  products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Enrich with seller info
  products = products.map(p => {
    const seller = mockUsers.get(p.sellerId);
    return { ...p, sellerUsername: seller?.username || "Unknown", sellerEmail: seller?.email || "" };
  });

  const pageNum = Number(page), limitNum = Number(limit);
  const total = products.length;
  const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ products: paginated, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.put("/products/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!["active", "pending", "rejected", "sold"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const db = getLocalDB();
  const idx = db.products.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Product not found" }); return; }
  db.products[idx].status = status;
  saveLocalDB();
  res.json({ success: true, status });
});

router.put("/products/:id/featured", requireAdmin, (req, res) => {
  const { featured } = req.body;
  const db = getLocalDB();
  const idx = db.products.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Product not found" }); return; }
  db.products[idx].featured = !!featured;
  saveLocalDB();
  res.json({ success: true, featured: !!featured });
});

router.delete("/products/:id", requireAdmin, (req, res) => {
  const db = getLocalDB();
  const before = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  if (db.products.length === before) { res.status(404).json({ error: "Product not found" }); return; }
  saveLocalDB();
  res.json({ success: true });
});

// ── Rooms ─────────────────────────────────────────────────────────────────────
router.get("/rooms", requireAdmin, (req, res) => {
  const { search, available, page = "1", limit = "20" } = req.query as any;
  const db = getLocalDB();
  let rooms = [...db.rooms];

  if (search) rooms = rooms.filter(r => r.title?.toLowerCase().includes(search.toLowerCase()));
  if (available !== undefined) rooms = rooms.filter(r => String(r.available) === available);

  rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pageNum = Number(page), limitNum = Number(limit);
  const total = rooms.length;
  const paginated = rooms.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ rooms: paginated, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.put("/rooms/:id/available", requireAdmin, (req, res) => {
  const { available } = req.body;
  const db = getLocalDB();
  const idx = db.rooms.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Room not found" }); return; }
  db.rooms[idx].available = !!available;
  saveLocalDB();
  res.json({ success: true });
});

router.delete("/rooms/:id", requireAdmin, (req, res) => {
  const db = getLocalDB();
  db.rooms = db.rooms.filter((r: any) => r.id !== req.params.id);
  saveLocalDB();
  res.json({ success: true });
});

// ── Food Vendors ──────────────────────────────────────────────────────────────
router.get("/food-vendors", requireAdmin, (req, res) => {
  const { search, page = "1", limit = "20" } = req.query as any;
  const db = getLocalDB();
  let vendors = [...db.foodVendors];

  if (search) vendors = vendors.filter(v => v.name?.toLowerCase().includes(search.toLowerCase()));
  vendors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pageNum = Number(page), limitNum = Number(limit);
  const total = vendors.length;
  const paginated = vendors.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ vendors: paginated, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.put("/food-vendors/:id/toggle", requireAdmin, (req, res) => {
  const db = getLocalDB();
  const idx = db.foodVendors.findIndex((v: any) => v.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Vendor not found" }); return; }
  db.foodVendors[idx].isOpen = !db.foodVendors[idx].isOpen;
  saveLocalDB();
  res.json({ success: true, isOpen: db.foodVendors[idx].isOpen });
});

router.delete("/food-vendors/:id", requireAdmin, (req, res) => {
  const db = getLocalDB();
  db.foodVendors = db.foodVendors.filter((v: any) => v.id !== req.params.id);
  db.foodItems = db.foodItems.filter((i: any) => i.vendorId !== req.params.id);
  saveLocalDB();
  res.json({ success: true });
});

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", requireAdmin, (req, res) => {
  const { status, page = "1", limit = "20" } = req.query as any;
  const db = getLocalDB();
  let orders = [...db.orders];

  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Enrich with buyer info
  orders = orders.map(o => {
    const buyer = mockUsers.get(o.buyerId);
    return { ...o, buyerUsername: buyer?.username || "Unknown", buyerEmail: buyer?.email || "" };
  });

  const pageNum = Number(page), limitNum = Number(limit);
  const total = orders.length;
  const paginated = orders.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ orders: paginated, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

router.put("/orders/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body;
  const db = getLocalDB();
  const idx = db.orders.findIndex((o: any) => o.id === req.params.id || o.orderId === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Order not found" }); return; }
  db.orders[idx].status = status;
  saveLocalDB();
  res.json({ success: true, status });
});

// ── Admin user creation ───────────────────────────────────────────────────────
router.post("/make-admin", requireAdmin, (req, res) => {
  const { userId } = req.body;
  const user = mockUsers.get(userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  user.role = "admin";
  const db = getLocalDB();
  const idx = db.users.findIndex((u: any) => u.id === userId);
  if (idx !== -1) { db.users[idx].role = "admin"; saveLocalDB(); }
  res.json({ success: true });
});

// Bootstrap: promote self to admin (only works if zero admins exist)
router.post("/bootstrap", (req, res) => {
  const userId = extractUser(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const allUsers = [...mockUsers.values()];
  const hasAdmin = allUsers.some(u => u.role === "admin");
  if (hasAdmin) { res.status(403).json({ error: "Admin already exists" }); return; }
  const user = mockUsers.get(userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  user.role = "admin";
  const db = getLocalDB();
  const idx = db.users.findIndex((u: any) => u.id === userId);
  if (idx !== -1) { db.users[idx].role = "admin"; saveLocalDB(); }
  res.json({ success: true, message: "You are now admin" });
});

export default router;
