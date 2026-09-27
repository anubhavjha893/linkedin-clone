import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	createPost,
	getFeedPosts,
	deletePost,
	getPostById,
	createComment,
	editComment,
	deleteComment,
	likePost,
	repostPost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/comment", protectRoute, createComment);
router.put("/:id/comment/:commentId", protectRoute, editComment);
router.delete("/:id/comment/:commentId", protectRoute, deleteComment);
router.post("/:id/like", protectRoute, likePost);
router.post("/:id/repost", protectRoute, repostPost);

export default router;
