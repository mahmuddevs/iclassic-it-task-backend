import type { Document } from "mongoose";
import { User } from "../models/user.model.js";
import type { IUser } from "../types/model-types/user.type.js";
import { env } from "../config/env.js";
import ms from "ms";
import type { StringValue } from "ms";
import type { CookieOptions } from "express";

const buildCookieOptions = (maxAge?: number): CookieOptions => {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/",
    ...(maxAge !== undefined && { maxAge }),
  };
};

export const AuthService = {
  findUserByEmail: async (email: string) => {
    return await User.findOne({ email }).select("+password");
  },

  getUserWithPermissions: async (email: string) => {
    const users = await User.aggregate([
      { $match: { email } },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "name",
          as: "roleData",
        },
      },
      { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "permissions",
          let: { rolePerms: { $ifNull: ["$roleData.permissions", []] } },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$rolePerms"] },
              },
            },
            { $project: { name: 1, module: 1, _id: 0 } },
          ],
          as: "permissions",
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
          permissions: 1,
        },
      },
    ]);
    return users[0] ?? null;
  },

  getCookieConfig: (
    cookies: { name: string; value: string; expiration: string }[]
  ) => {
    return cookies.map(({ name, value, expiration }) => ({
      name,
      value,
      options: buildCookieOptions(ms(expiration as StringValue)),
    }));
  },

  getLogoutCookieConfig: (cookieNames: string[]) => {
    return cookieNames.map((name) => ({
      name,
      value: "",
      clear: true,
      options: buildCookieOptions(),
    }));
  },

  getFormattedUser: (user: Document & IUser) => {
    const { password, ...userData } = user.toObject();
    return userData;
  },
};
