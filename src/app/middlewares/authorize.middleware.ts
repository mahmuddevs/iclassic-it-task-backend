import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils.js";
import { env } from "../config/env.js";
import { response } from "../utils/apiResponse.js";
import { AuthService } from "../services/auth.services.js";

export const authorize = (requiredPermission?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      const hasRefreshToken = !!req.cookies.refreshToken;
      return response.error(res, {
        message: "Authentication required. Please log in.",
        statusCode: 401,
        ...(!hasRefreshToken && { cookie: AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]) }),
      });
    }

    let payload;
    try {
      // 1. Verify the access token
      payload = await verifyToken(accessToken, env.accessTokenSecret);
    } catch (err: any) {
      const isExpired = err?.code === "ERR_JWT_EXPIRED" || err?.name === "JWTExpired" || err?.name === "TokenExpiredError"

      if (isExpired) {
        return response.error(res, {
          message: "Session expired. Please log in again.",
          statusCode: 401,
        });
      }

      return response.error(res, {
        message: "Invalid token. Please log in again.",
        statusCode: 401,
        data: { code: "TOKEN_INVALID" },
        cookie: AuthService.getLogoutCookieConfig(["accessToken", "refreshToken"]),
      });
    }

    try {
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
      return response.error(res, {
        message: err.message || "Internal server error during authorization.",
        statusCode: 500,
      });
    }
  };
};


