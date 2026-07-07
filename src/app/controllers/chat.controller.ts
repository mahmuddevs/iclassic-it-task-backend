import type { Request, Response } from "express";
import { Message } from "../models/message.model.js";
import { response } from "../utils/apiResponse.js";

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    // Retrieve the last 100 chat messages from database
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Reverse them to chronological order
    messages.reverse();

    return response.success(res, {
      data: messages,
      statusCode: 200,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return response.error(res, {
      message: err.message || "Failed to fetch chat history",
      statusCode: 500,
    });
  }
};
