import type { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { response } from "../utils/apiResponse.js";
import { buildQuery } from "../utils/queryBuilder.js";

// 1. Get All Users (Search, Filter, Sort, Paginate)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const query = buildQuery(User, req.query);
    query.modelQuery = query.modelQuery.find({ role: { $ne: "Admin" } });
    const result = await query
      .search(["firstName", "lastName", "email"])
      .filter()
      .sort()
      .paginate()
      .execute();

    return response.success(res, {
      message: "Users retrieved successfully",
      data: {
        users: result.data,
        meta: result.meta,
      },
      statusCode: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve users";
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    });
  }
};

// 2. Update User Role
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return response.error(res, {
        message: "User not found",
        statusCode: 404,
      });
    }

    return response.success(res, {
      message: "User role updated successfully",
      data: updatedUser,
      statusCode: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update user role";
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    });
  }
};

// 3. Delete User
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return response.error(res, {
        message: "User not found",
        statusCode: 404,
      });
    }

    return response.success(res, {
      message: "User deleted successfully",
      statusCode: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
    return response.error(res, {
      message: errorMessage,
      statusCode: 500,
    });
  }
};
