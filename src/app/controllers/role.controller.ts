import type { Request, Response } from "express";
import { Role } from "../models/role.model.js";
import { Permission } from "../models/permission.model.js";
import { response } from "../utils/apiResponse.js";

// 1. Get All Roles
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({})
      .select("-createdAt -updatedAt -__v")
      .populate("permissions", "-createdAt -updatedAt -__v");
    return response.success(res, {
      message: "Roles retrieved successfully",
      data: roles,
      statusCode: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve roles";
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    });
  }
};

// 2. Get All System Permissions
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await Permission.find({}).select("-createdAt -updatedAt -__v");
    return response.success(res, {
      message: "Permissions retrieved successfully",
      data: permissions,
      statusCode: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve permissions";
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    });
  }
};

// 3. Update Role Permissions
export const updateRolePermissions = async (req: Request, res: Response) => {
  const { roleName } = req.params;
  const { permissionNames } = req.body;

  try {
    // Find matching permission documents in database
    const dbPermissions = await Permission.find({ name: { $in: permissionNames } });
    const permissionIds = dbPermissions.map(p => p._id);

    const updatedRole = await Role.findOneAndUpdate(
      { name: roleName },
      { permissions: permissionIds },
      { new: true }
    ).populate("permissions");

    if (!updatedRole) {
      return response.error(res, {
        message: "Role not found",
        statusCode: 404,
      });
    }

    return response.success(res, {
      message: `${roleName} permissions updated successfully.`,
      data: updatedRole,
      statusCode: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update role permissions";
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    });
  }
};
