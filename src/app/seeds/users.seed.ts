import { User } from "../models/user.model.js";

export const seedUsers = async () => {
  console.log("Seeding users...");
  await User.deleteMany({});

  const users = [
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "password123",
      role: "Admin",
    },
    {
      firstName: "Manager",
      lastName: "User",
      email: "manager@example.com",
      password: "password123",
      role: "Manager",
    },
    {
      firstName: "Employee",
      lastName: "User",
      email: "employee@example.com",
      password: "password123",
      role: "Employee",
    },
  ];

  for (const userData of users) {
    // User.create will trigger pre-save hook to hash password
    await User.create(userData);
  }

  console.log("Users seeded successfully.");
};
