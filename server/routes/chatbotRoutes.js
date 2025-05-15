import express from "express";
import { chatWithDeepSeek } from "../controllers/chatbotController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", chatWithDeepSeek);

export default router;
