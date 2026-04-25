import fs from "fs";
import path from "path";

// Enhanced laptop database with comprehensive sample data
const DATA_FILE = path.join(process.cwd(), "local-laptop-database.json");

interface MockDB {
  users: any[];
  products: any[];
  foodItems: any[];
  foodVendors: any[];
  orders: any[];
  rooms: any[];
  cartItems: any[];
  wishlist: any[];
  lastUpdated: string;
}

function initializeSampleData(): MockDB {
  return {
    users: [],
    products: [],
    foodItems: [],
    foodVendors: [],
    orders: [],
    rooms: [],
    cartItems: [],
    wishlist: [],
    lastUpdated: new Date().toISOString(),
  };
}

function loadData(): MockDB {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      console.log("📂 Loaded existing laptop database from:", DATA_FILE);
      
      // Convert date strings back to Date objects
      const reviveDate = (items: any[]) => {
        if (!items) return;
        items.forEach((item: any) => { 
          if (item.createdAt) item.createdAt = new Date(item.createdAt); 
        });
      };

      reviveDate(parsed.users);
      reviveDate(parsed.products);
      reviveDate(parsed.foodItems);
      reviveDate(parsed.foodVendors);
      reviveDate(parsed.orders);
      reviveDate(parsed.rooms);
      reviveDate(parsed.cartItems);
      
      return {
        users: parsed.users || [],
        products: parsed.products || [],
        foodItems: parsed.foodItems || [],
        foodVendors: parsed.foodVendors || [],
        orders: parsed.orders || [],
        rooms: parsed.rooms || [],
        cartItems: parsed.cartItems || [],
        wishlist: parsed.wishlist || [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("❌ Failed to read laptop database, creating new one:", err);
  }
  
  console.log("🆕 Creating new laptop database at:", DATA_FILE);
  return initializeSampleData();
}

function saveData(data: MockDB) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("💾 Saved laptop database to:", DATA_FILE);
  } catch (err) {
    console.error("❌ Failed to save laptop database:", err);
  }
}

let dbCache: MockDB | null = null;

export function getLocalDB(): MockDB {
  if (!dbCache) {
    dbCache = loadData();
    
    // Auto-save on first load if new
    if (!fs.existsSync(DATA_FILE)) {
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

export function resetLocalDB(): MockDB {
  console.log("🔄 Resetting laptop database...");
  dbCache = {
    users: [],
    products: [],
    foodItems: [],
    foodVendors: [],
    orders: [],
    rooms: [],
    cartItems: [],
    wishlist: [],
    lastUpdated: new Date().toISOString(),
  };
  saveData(dbCache);
  return dbCache;
}
