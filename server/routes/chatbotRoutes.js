import express from "express";
import { chatWithDeepSeek } from "../controllers/chatbotController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route
router.post("/", protectRoute, chatWithDeepSeek);

export default router;
