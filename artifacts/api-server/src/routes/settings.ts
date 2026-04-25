import { Router, type IRouter } from "express";
import { extractUser, mockUsers } from "./auth";
import { getLocalDB, saveLocalDB } from "../lib/mock-storage";

const router: IRouter = Router();

// Default settings
const DEFAULT_SETTINGS = {
  googleClientId: "",
  googleMapsApiKey: "",
  siteName: "CampusMart",
  supportEmail: "support@campusmart.ac.ke",
  deliveryFee: 0,
  payOnDelivery: true,
  maintenanceMode: false,
  allowRegistrations: true,
  maxCartItems: 20,
  featuredProductsLimit: 8,
  whatsappSupport: "",
};

function getSettings() {
  const db = getLocalDB() as any;
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  return db.settings;
}

function requireAdmin(req: any, res: any, next: any) {
  const userId = extractUser(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = mockUsers.get(userId);
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }
  next();
}

// Public: get non-sensitive settings (for frontend to use API keys)
router.get("/public", (req, res) => {
  const s = getSettings();
  res.json({
    googleClientId: s.googleClientId || "",
    googleMapsApiKey: s.googleMapsApiKey || "",
    siteName: s.siteName,
    payOnDelivery: s.payOnDelivery,
    deliveryFee: s.deliveryFee,
    maintenanceMode: s.maintenanceMode,
    allowRegistrations: s.allowRegistrations,
    whatsappSupport: s.whatsappSupport,
  });
});

// Admin: get all settings
router.get("/", requireAdmin, (req, res) => {
  res.json(getSettings());
});

// Admin: update settings
router.put("/", requireAdmin, (req, res) => {
  const db = getLocalDB() as any;
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  const allowed = Object.keys(DEFAULT_SETTINGS);
  for (const key of allowed) {
    if (req.body[key] !== undefined) db.settings[key] = req.body[key];
  }
  saveLocalDB();
  res.json(db.settings);
});

export default router;
