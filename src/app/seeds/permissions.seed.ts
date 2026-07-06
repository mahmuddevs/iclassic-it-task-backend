import { Permission } from "../models/permission.model.js";

export const seedPermissions = async () => {
  console.log("Seeding permissions...");
  await Permission.deleteMany({});

  const permissions = [
    { name: "users.create", module: "users" },
    { name: "users.read", module: "users" },
    { name: "users.update", module: "users" },
    { name: "users.delete", module: "users" },
    { name: "products.create", module: "products" },
    { name: "products.read", module: "products" },
    { name: "products.update", module: "products" },
    { name: "products.delete", module: "products" },
  ];

  for (const perm of permissions) {
    await Permission.findOneAndUpdate(
      { name: perm.name },
      perm,
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log("Permissions seeded successfully.");
};
