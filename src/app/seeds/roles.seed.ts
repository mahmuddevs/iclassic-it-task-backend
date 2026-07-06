import { Role } from "../models/role.model.js";
import { Permission } from "../models/permission.model.js";

export const seedRoles = async () => {
  console.log("Seeding roles...");
  await Role.deleteMany({});

  // 1. Get permissions for Admin
  const adminPermissions = await Permission.find({
    name: {
      $in: [
        "users.create",
        "users.read",
        "users.update",
        "users.delete",
        "products.create",
        "products.read",
        "products.update",
        "products.delete"
      ]
    }
  });

  const adminPermIds = adminPermissions.map(p => p._id);

  // 2. Get permissions for Manager (product CRUD)
  const managerPermissions = await Permission.find({
    name: {
      $in: [
        "products.create",
        "products.read",
        "products.update",
        "products.delete"
      ]
    }
  });

  const managerPermIds = managerPermissions.map(p => p._id);

  const roles = [
    {
      name: "Admin",
      description: "Administrator with full access",
      permissions: adminPermIds
    },
    {
      name: "Manager",
      description: "Manager with medium level access",
      permissions: managerPermIds
    },
    {
      name: "Employee",
      description: "Regular employee access",
      permissions: []
    },
  ];

  for (const role of roles) {
    await Role.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log("Roles seeded successfully.");
};
