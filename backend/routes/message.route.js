import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getConversations, getMessages, getUnreadCount, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/unread-count", protectRoute, getUnreadCount);
router.get("/:userId", protectRoute, getMessages);
router.post("/:userId", protectRoute, sendMessage);

export default router;
