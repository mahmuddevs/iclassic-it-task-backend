import type { Request, Response } from "express";
import { response } from "../utils/apiResponse.js";

const login = async (req: Request, res: Response) => {
  return response.success(res, {
    message: "User logged in successfully",
    statusCode: 200,
    data: null
  });
}

export { login };