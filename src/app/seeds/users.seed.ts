import { User } from "../models/user.model.js";

export const seedUsers = async () => {
  console.log("Seeding users...");

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
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      // User.create will trigger pre-save hook to hash password
      await User.create(userData);
    } else {
      existing.firstName = userData.firstName;
      existing.lastName = userData.lastName;
      existing.role = userData.role;
      // We only save if we want to update. Note that save() will trigger hashing if password is modified.
      // But here password is not modified, so it won't be rehashed, which is correct.
      await existing.save();
    }
  }

  console.log("Users seeded successfully.");
};
