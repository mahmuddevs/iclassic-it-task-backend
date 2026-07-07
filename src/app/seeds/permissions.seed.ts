import { Permission } from "../models/permission.model.js";

export const seedPermissions = async () => {
  console.log("Seeding permissions...");
  await Permission.deleteMany({});

  const permissions = [
    { name: "users.read", module: "users" },
    { name: "users.update", module: "users" },
    { name: "users.delete", module: "users" },
    { name: "products.create", module: "products" },
    { name: "products.read", module: "products" },
    { name: "products.update", module: "products" },
    { name: "products.delete", module: "products" },
    { name: "sales.create", module: "sales" },
    { name: "sales.read", module: "sales" },
    { name: "sales.delete", module: "sales" },
    { name: "permissions.read", module: "permissions" },
    { name: "permissions.update", module: "permissions" },
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
