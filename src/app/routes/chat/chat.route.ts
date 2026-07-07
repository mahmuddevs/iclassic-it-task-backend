import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { getChatHistory } from "../../controllers/chat.controller.js";

const router = Router();

// Protect the chat history endpoint using the existing authorize middleware
router.get("/messages", authorize(), getChatHistory);

export default router;
