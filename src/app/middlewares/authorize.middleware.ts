import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils.js";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { response } from "../utils/apiResponse.js";

export const authorize = (requiredPermission?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return response.error(res, {
        message: "Authentication required. Please log in.",
        statusCode: 401,
      });
    }

    try {
      // 1. Verify the access token
      const payload = await verifyToken(accessToken, env.accessTokenSecret);

      // 2. Query User, Role, and Permissions in one aggregation query
      const users = await User.aggregate([
        { $match: { email: payload.email } },
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
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$rolePerms"] },
                      ...(requiredPermission ? [{ $eq: ["$name", requiredPermission] }] : [])
                    ]
                  }
                }
              },
              { $project: { name: 1, module: 1, _id: 0 } }
            ],
            as: "permissions",
          },
        },
        {
          $project: {
            _id: 1,
            email: 1,
            firstName: 1,
            lastName: 1,
            role: 1,
            permissions: 1,
          }
        }
      ]);

      const user = users[0];

      // If user doesn't exist
      if (!user) {
        return response.error(res, {
          message: "User not found or unauthorized.",
          statusCode: 401,
        });
      }

      // 3. Guard check (Authorization)
      if (requiredPermission && user.permissions.length === 0) {
        return response.error(res, {
          message: "Forbidden. You do not have permission to perform this action.",
          statusCode: 403,
        });
      }


      next();
    } catch (err: any) {
      return response.error(res, {
        message: "Invalid or expired token. Please log in again.",
        statusCode: 401,
      });
    }
  };
};


