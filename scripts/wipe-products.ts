import { db, productsTable, ordersTable, cartItemsTable, wishlistTable } from "../lib/db/src";

async function main() {
  console.log("Deleting all test data...");
  try {
    await db.delete(cartItemsTable);
    await db.delete(wishlistTable);
    // Since ordersTable.items is a jsonb array of snapshots, we don't have a direct FK 
    // to productsTable that stops deletion, but let's clear orders anyway to be safe.
    await db.delete(ordersTable);
    const deleted = await db.delete(productsTable).returning();
    console.log(`Successfully deleted ${deleted.length} products.`);
  } catch (err) {
    console.error("Database deletion failed (likely in mock mode or DB down):", err);
  }
}

main().catch(console.error);
