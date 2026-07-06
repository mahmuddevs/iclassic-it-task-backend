import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils.js";
import { env } from "../config/env.js";
import { response } from "../utils/apiResponse.js";
import { AuthService } from "../services/auth.services.js";

export const authorize = (requiredPermission?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return response.error(res, {
        message: "Authentication required. Please log in.",
        statusCode: 401,
        cookie: AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]),
      });
    }

    try {
      // 1. Verify the access token
      const payload = await verifyToken(accessToken, env.accessTokenSecret);

      // 2. Fetch user with all their role permissions
      const user = await AuthService.getUserWithPermissions(payload.email);

      // If user doesn't exist
      if (!user) {
        return response.error(res, {
          message: "User not found or unauthorized.",
          statusCode: 401,
          cookie: AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]),
        });
      }

      // 3. Guard check (Authorization)
      if (requiredPermission && !user.permissions.some((p: { name: string }) => p.name === requiredPermission)) {
        return response.error(res, {
          message: "Forbidden. You do not have permission to perform this action.",
          statusCode: 403,
        });
      }

      next();
    } catch (err: any) {
      const isExpired = err?.name === "TokenExpiredError"

      if (isExpired) {
        return response.error(res, {
          message: "Session expired. Please log in again.",
          statusCode: 401,
          // No cookie clearing — frontend refresh flow will handle token renewal
        });
      }

      return response.error(res, {
        message: "Invalid token. Please log in again.",
        statusCode: 401,
        data: { code: "TOKEN_INVALID" },
        cookie: AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]),
      });
    }
  };
};


