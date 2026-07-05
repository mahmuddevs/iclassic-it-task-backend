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
    ...(env.cookieDomain && { domain: env.cookieDomain }),
    ...(maxAge !== undefined && { maxAge }),
  };
};

export const AuthService = {
  findUserByEmail: async (email: string) => {
    return await User.findOne({ email }).select("+password");
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
