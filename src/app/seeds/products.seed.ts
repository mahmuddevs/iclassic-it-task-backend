import { Product } from "../models/product.model.js"

export const seedProducts = async () => {
  console.log("Seeding products...")

  // Clear the collection to ensure a clean state
  await Product.deleteMany({})

  const products = [
    {
      name: "Pro Laptop 15",
      sku: "PRO-LAP-15",
      category: "Electronics",
      purchasePrice: 800,
      sellingPrice: 1200,
      stockQuantity: 15,
      image: "uploads/products/laptop.png",
    },
    {
      name: "Smartphone X",
      sku: "SMART-X",
      category: "Electronics",
      purchasePrice: 400,
      sellingPrice: 650,
      stockQuantity: 30,
      image: "uploads/products/phone.png",
    },
    {
      name: "Mechanical Keyboard",
      sku: "MECH-KB",
      category: "Accessories",
      purchasePrice: 45,
      sellingPrice: 89,
      stockQuantity: 50,
      image: "uploads/products/keyboard.png",
    },
    {
      name: "UltraWide Monitor 34",
      sku: "UW-MON-34",
      category: "Electronics",
      purchasePrice: 250,
      sellingPrice: 450,
      stockQuantity: 10,
      image: "uploads/products/monitor.png",
    },
    {
      name: "Wireless Ergonomic Mouse",
      sku: "WIRE-MS",
      category: "Accessories",
      purchasePrice: 15,
      sellingPrice: 35,
      stockQuantity: 100,
      image: "uploads/products/mouse.png",
    },
    {
      name: "Gaming Laptop 17",
      sku: "GAME-LAP-17",
      category: "Electronics",
      purchasePrice: 1200,
      sellingPrice: 1800,
      stockQuantity: 8,
      image: "uploads/products/laptop.png",
    },
    {
      name: "Budget Smartphone Y",
      sku: "SMART-Y",
      category: "Electronics",
      purchasePrice: 200,
      sellingPrice: 299,
      stockQuantity: 45,
      image: "uploads/products/phone.png",
    },
    {
      name: "RGB Keyboard Lite",
      sku: "RGB-KB-LITE",
      category: "Accessories",
      purchasePrice: 25,
      sellingPrice: 49,
      stockQuantity: 75,
      image: "uploads/products/keyboard.png",
    },
    {
      name: "4K Office Monitor 27",
      sku: "4K-MON-27",
      category: "Electronics",
      purchasePrice: 180,
      sellingPrice: 299,
      stockQuantity: 20,
      image: "uploads/products/monitor.png",
    },
    {
      name: "Bluetooth Travel Mouse",
      sku: "BT-MS-TRAV",
      category: "Accessories",
      purchasePrice: 12,
      sellingPrice: 25,
      stockQuantity: 120,
      image: "uploads/products/mouse.png",
    },
    {
      name: "Developer Workstation Pro",
      sku: "DEV-LAP-PRO",
      category: "Electronics",
      purchasePrice: 1500,
      sellingPrice: 2200,
      stockQuantity: 5,
      image: "uploads/products/laptop.png",
    },
    {
      name: "Dual-Mode Mechanical KB",
      sku: "DM-MECH-KB",
      category: "Accessories",
      purchasePrice: 70,
      sellingPrice: 129,
      stockQuantity: 25,
      image: "uploads/products/keyboard.png",
    },
  ]

  // Create products in a single operation
  await Product.create(products)

  console.log("Products seeded successfully.")
}
