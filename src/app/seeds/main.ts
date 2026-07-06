import mongoose from "mongoose";
import { seedPermissions } from "./permissions.seed.js";
import { seedRoles } from "./roles.seed.js";
import { seedUsers } from "./users.seed.js";
import { seedProducts } from "./products.seed.js";
import connectDB from "../config/db-config.js";

const runAllSeeds = async () => {
  try {
    console.log("=== Starting Database Seeding ===");

    // Connect to the database
    await connectDB();

    // 1. Seed Permissions
    await seedPermissions();

    // 2. Seed Roles (depends on Permissions)
    await seedRoles();

    // 3. Seed Users (depends on Roles)
    await seedUsers();

    // 4. Seed Products
    await seedProducts();

    console.log("=== Database Seeding Completed Successfully ===");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("=== Database Seeding Failed ===", error);
    process.exit(1);
  }
};

runAllSeeds();
