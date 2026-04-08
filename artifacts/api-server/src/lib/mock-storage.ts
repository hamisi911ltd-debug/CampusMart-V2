import fs from "fs";
import path from "path";

// A dedicated local JSON file on the user's laptop for testing
const DATA_FILE = path.join(process.cwd(), "local-laptop-database.json");

interface MockDB {
  users: any[];
  products: any[];
  foodItems: any[];
  foodVendors: any[];
  orders: any[];
  rooms: any[];
  cartItems: any[];
}

function loadData(): MockDB {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      
      const reviveDate = (items: any[]) => {
        if (!items) return;
        items.forEach((u: any) => { if (u.createdAt) u.createdAt = new Date(u.createdAt); });
      };

      reviveDate(parsed.users);
      reviveDate(parsed.products);
      reviveDate(parsed.foodItems);
      reviveDate(parsed.foodVendors);
      reviveDate(parsed.orders);
      reviveDate(parsed.cartItems);
      
      return {
        users: parsed.users || [],
        products: parsed.products || [],
        foodItems: parsed.foodItems || [],
        foodVendors: parsed.foodVendors || [],
        orders: parsed.orders || [],
        rooms: parsed.rooms || [],
        cartItems: parsed.cartItems || [],
      };
    }
  } catch (err) {
    console.warn("Failed to read local DB, initializing new one", err);
  }
  return { users: [], products: [], foodItems: [], foodVendors: [], orders: [], rooms: [], cartItems: [] };
}

function saveData(data: MockDB) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local DB", err);
  }
}

let dbCache: MockDB | null = null;

export function getLocalDB(): MockDB {
  if (!dbCache) {
    dbCache = loadData();
    
    // Seed sample data if empty
    if (dbCache.foodVendors.length === 0) {
      dbCache.foodVendors.push({
        id: "vendor1",
        name: "Campus Eats",
        campus: "Main Campus",
        bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=200&fit=crop",
        rating: 4.5,
        deliveryTime: "20-30 min",
        minOrder: 500,
        categories: ["Pizza", "Burgers"],
        isOpen: true,
        createdAt: new Date(),
      });
      dbCache.foodItems.push({
        id: "food1",
        vendorId: "vendor1",
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella",
        price: 1200,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=300&h=300&fit=crop",
        category: "Pizza",
        available: true,
        createdAt: new Date(),
      });
      saveData(dbCache);
    }
  }
  return dbCache;
}

export function saveLocalDB() {
  if (dbCache) {
    saveData(dbCache);
  }
}
