import { db } from "@workspace/db";
import {
  usersTable, productsTable, roomsTable,
  foodVendorsTable, foodItemsTable
} from "@workspace/db";
import { createHash, randomBytes } from "crypto";

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "campusmart-salt").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  const users = [
    { id: generateId(), email: "demo@campusmart.co.ke", phone: "0712345678", username: "demo_student", campus: "UoN" },
    { id: generateId(), email: "alice@campusmart.co.ke", phone: "0723456789", username: "alice_ku", campus: "KU" },
    { id: generateId(), email: "bob@campusmart.co.ke", phone: "0734567890", username: "bob_jkuat", campus: "JKUAT" },
    { id: generateId(), email: "cynthia@campusmart.co.ke", phone: "0745678901", username: "cynthia_strathmore", campus: "Strathmore" },
  ];

  for (const user of users) {
    try {
      await db.insert(usersTable).values({
        ...user,
        passwordHash: hashPassword("password123"),
        role: "student",
      }).onConflictDoNothing();
    } catch (e) {
      console.log(`User ${user.username} may already exist`);
    }
  }

  console.log("Users seeded");

  const products = [
    {
      id: generateId(), sellerId: users[1].id,
      title: "Organic Chemistry Textbook (8th Edition)",
      description: "Perfect condition, barely used. Includes all chapters for first and second year chemistry.",
      price: 1500, originalPrice: 3500, category: "books", condition: "like_new" as const,
      campus: "KU", images: [], stock: 1, status: "active" as const, badge: "SALE" as const, featured: true,
    },
    {
      id: generateId(), sellerId: users[2].id,
      title: "Samsung Galaxy A23 - 128GB",
      description: "Excellent condition, comes with original charger and box. 6GB RAM, 128GB storage.",
      price: 18000, originalPrice: 25000, category: "electronics", condition: "like_new" as const,
      campus: "JKUAT", images: [], stock: 1, status: "active" as const, badge: "HOT" as const, featured: true,
    },
    {
      id: generateId(), sellerId: users[3].id,
      title: "Scientific Calculator - Casio FX-991EX",
      description: "Brand new in box, never used. Perfect for engineering and science courses.",
      price: 2800, originalPrice: null, category: "stationery", condition: "new" as const,
      campus: "Strathmore", images: [], stock: 5, status: "active" as const, badge: "NEW" as const, featured: true,
    },
    {
      id: generateId(), sellerId: users[1].id,
      title: "HP Pavilion Laptop 15\" - Core i5",
      description: "2022 model, 8GB RAM, 512GB SSD. Great for programming and coursework.",
      price: 45000, originalPrice: 65000, category: "electronics", condition: "good" as const,
      campus: "KU", images: [], stock: 1, status: "active" as const, badge: "HOT" as const, featured: true,
    },
    {
      id: generateId(), sellerId: users[2].id,
      title: "Business Law Notes - Comprehensive",
      description: "Complete notes covering all topics for Business Law units 1-3.",
      price: 500, originalPrice: null, category: "books", condition: "new" as const,
      campus: "JKUAT", images: [], stock: 10, status: "active" as const, badge: "NEW" as const, featured: false,
    },
    {
      id: generateId(), sellerId: users[3].id,
      title: "Mini Fridge - Perfect for Hostel",
      description: "60L mini fridge, energy efficient. Great for hostel living.",
      price: 8500, originalPrice: 12000, category: "furniture", condition: "good" as const,
      campus: "Strathmore", images: [], stock: 1, status: "active" as const, badge: "SALE" as const, featured: false,
    },
    {
      id: generateId(), sellerId: users[0].id,
      title: "Bluetooth Earbuds - JBL Tune 120",
      description: "6 hours playback, quick charge. Comes with carrying case.",
      price: 3200, originalPrice: 5500, category: "electronics", condition: "like_new" as const,
      campus: "UoN", images: [], stock: 2, status: "active" as const, badge: "SALE" as const, featured: false,
    },
    {
      id: generateId(), sellerId: users[1].id,
      title: "Introduction to Programming (Python)",
      description: "Python for Beginners — great for CS1 students at KU.",
      price: 800, originalPrice: 1500, category: "books", condition: "good" as const,
      campus: "KU", images: [], stock: 3, status: "active" as const, badge: "SALE" as const, featured: false,
    },
    {
      id: generateId(), sellerId: users[2].id,
      title: "Graphic T-Shirts (3 Pack)",
      description: "Campus-style tees, size M. Only worn twice each.",
      price: 1200, originalPrice: null, category: "fashion", condition: "like_new" as const,
      campus: "JKUAT", images: [], stock: 1, status: "active" as const, badge: "NEW" as const, featured: false,
    },
    {
      id: generateId(), sellerId: users[3].id,
      title: "Desk Lamp with USB Charging Port",
      description: "LED desk lamp, adjustable brightness. Includes USB-A and USB-C ports.",
      price: 1800, originalPrice: 2500, category: "furniture", condition: "new" as const,
      campus: "Strathmore", images: [], stock: 4, status: "active" as const, badge: "NEW" as const, featured: false,
    },
  ];

  for (const product of products) {
    try {
      await db.insert(productsTable).values(product).onConflictDoNothing();
    } catch (e) {
      console.log(`Product may already exist: ${product.title}`);
    }
  }

  console.log("Products seeded");

  const rooms = [
    {
      id: generateId(), landlordId: users[0].id,
      title: "Self-contain Bedsitter — Near UoN",
      description: "Cozy bedsitter with en-suite bathroom. Walking distance to UoN main campus.",
      type: "bedsitter" as const, monthlyRent: 9500, campus: "UoN",
      distanceToCampus: "200m from UoN Main Campus",
      images: [], amenities: ["WiFi", "Water", "Security"], available: true, landlordPhone: "0712345678",
    },
    {
      id: generateId(), landlordId: users[1].id,
      title: "Single Room — Kenyatta University",
      description: "Spacious single room in a secure compound. 5 minutes to KU Gate A.",
      type: "single" as const, monthlyRent: 6000, campus: "KU",
      distanceToCampus: "500m from KU Main Gate",
      images: [], amenities: ["Water", "Security", "Furnished"], available: true, landlordPhone: "0723456789",
    },
    {
      id: generateId(), landlordId: users[2].id,
      title: "1 Bedroom Apartment — JKUAT Area",
      description: "Modern 1-bedroom with sitting room and kitchen. Ideal for couple or two students.",
      type: "one_bedroom" as const, monthlyRent: 14000, campus: "JKUAT",
      distanceToCampus: "1km from JKUAT Main Gate",
      images: [], amenities: ["WiFi", "Water", "Security", "Furnished"], available: true, landlordPhone: "0734567890",
    },
    {
      id: generateId(), landlordId: users[3].id,
      title: "Hostel Room — Strathmore University",
      description: "Shared hostel room with 2 other students. Meals available.",
      type: "hostel" as const, monthlyRent: 4500, campus: "Strathmore",
      distanceToCampus: "On campus",
      images: [], amenities: ["WiFi", "Water", "Security"], available: false, landlordPhone: "0745678901",
    },
    {
      id: generateId(), landlordId: users[0].id,
      title: "2 Bedroom — Parklands Near USIU",
      description: "Spacious 2-bedroom apartment in Parklands. Close to USIU and Strathmore.",
      type: "two_bedroom" as const, monthlyRent: 22000, campus: "USIU",
      distanceToCampus: "800m from USIU Campus",
      images: [], amenities: ["WiFi", "Water", "Security", "Furnished"], available: true, landlordPhone: "0712345678",
    },
  ];

  for (const room of rooms) {
    try {
      await db.insert(roomsTable).values(room).onConflictDoNothing();
    } catch (e) {
      console.log(`Room may already exist: ${room.title}`);
    }
  }

  console.log("Rooms seeded");

  const vendors = [
    {
      id: generateId(), name: "Mama Pima Kitchen", campus: "UoN",
      rating: 4.7, deliveryTime: "15-25 min", minOrder: 150,
      categories: ["Meals", "Snacks"], isOpen: true,
    },
    {
      id: generateId(), name: "Campus Bites", campus: "KU",
      rating: 4.5, deliveryTime: "20-35 min", minOrder: 200,
      categories: ["Meals", "Combos", "Drinks"], isOpen: true,
    },
    {
      id: generateId(), name: "Strathy Grills", campus: "Strathmore",
      rating: 4.8, deliveryTime: "10-20 min", minOrder: 250,
      categories: ["Snacks", "Drinks", "Healthy"], isOpen: true,
    },
    {
      id: generateId(), name: "JKUAT Canteen", campus: "JKUAT",
      rating: 4.2, deliveryTime: "25-40 min", minOrder: 100,
      categories: ["Meals", "Snacks"], isOpen: false,
    },
  ];

  for (const vendor of vendors) {
    try {
      await db.insert(foodVendorsTable).values(vendor).onConflictDoNothing();
    } catch (e) {
      console.log(`Vendor may already exist: ${vendor.name}`);
    }
  }

  console.log("Food vendors seeded");

  const foodItems = [
    { id: generateId(), vendorId: vendors[0].id, name: "Ugali + Chicken", description: "Full ugali plate with nyama choma chicken, kachumbari & sukuma.", price: 250, category: "Meals", available: true },
    { id: generateId(), vendorId: vendors[0].id, name: "Chapati Roll", description: "Chicken or beef chapati roll with veggies.", price: 120, category: "Snacks", available: true },
    { id: generateId(), vendorId: vendors[0].id, name: "Mandazi (6 pcs)", description: "Fresh mandazi, served warm with tea.", price: 60, category: "Snacks", available: true },
    { id: generateId(), vendorId: vendors[1].id, name: "Rice + Beef Stew", description: "Steamed basmati rice with slow-cooked beef stew.", price: 220, category: "Meals", available: true },
    { id: generateId(), vendorId: vendors[1].id, name: "Student Combo", description: "Rice + stew + soda + mandazi. Best value deal.", price: 350, category: "Combos", available: true },
    { id: generateId(), vendorId: vendors[1].id, name: "Passion Juice (500ml)", description: "Fresh pressed passion fruit juice.", price: 80, category: "Drinks", available: true },
    { id: generateId(), vendorId: vendors[2].id, name: "Grilled Chicken Wings", description: "6 spicy grilled wings with signature dipping sauce.", price: 320, category: "Snacks", available: true },
    { id: generateId(), vendorId: vendors[2].id, name: "Avocado Salad Bowl", description: "Fresh avocado, tomatoes, cucumber, lemon dressing.", price: 280, category: "Healthy", available: true },
    { id: generateId(), vendorId: vendors[2].id, name: "Smoothy (Mango/Strawberry)", description: "Blended fresh fruit smoothie, your choice of flavor.", price: 150, category: "Drinks", available: true },
    { id: generateId(), vendorId: vendors[3].id, name: "Githeri Special", description: "Seasoned githeri with veggies and chapati.", price: 180, category: "Meals", available: false },
  ];

  for (const item of foodItems) {
    try {
      await db.insert(foodItemsTable).values({ ...item, image: null }).onConflictDoNothing();
    } catch (e) {
      console.log(`Food item may already exist: ${item.name}`);
    }
  }

  console.log("Food items seeded");
  console.log("✅ Seeding complete! Demo account: demo@campusmart.co.ke / password123");
}

seed().catch(console.error).finally(() => process.exit(0));
