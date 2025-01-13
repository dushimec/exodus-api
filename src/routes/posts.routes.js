import { Router } from "express";
const postRoutes = Router();

import {
  postComment,
  createPost,
  getPosts,
  likeThePost,
  getPostById,
  replyToComment,
  editComment,
  deleteComment,
  getMostVisitedPosts,
  getMostLikedPosts,
  deletePost,
  editPost,
  getPostsByDestination,
  getUpcomingPosts,
  getPostPerformanceOverview,
} from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { singleUpload } from "../utils/multer.js";

// Post routes
postRoutes.get("/post-performance-overview", authenticateToken, getPostPerformanceOverview);
postRoutes.post("/create", authenticateToken, singleUpload, createPost);
postRoutes.post("/:postId/comment", authenticateToken, postComment);
postRoutes.put("/:postId/like", authenticateToken, likeThePost);
postRoutes.get("/", getPosts);
postRoutes.get("/upcoming", getUpcomingPosts);
postRoutes.get("/destination/:destination", getPostsByDestination);
postRoutes.get("/most-visited", getMostVisitedPosts);
postRoutes.get("/most-liked", getMostLikedPosts);
postRoutes.get("/:id", authenticateToken, getPostById);
postRoutes.delete("/:id", authenticateToken, deletePost);
postRoutes.put("/:id", authenticateToken, editPost);
postRoutes.post(
  "/:postId/comments/:commentId/replies",
  authenticateToken,
  replyToComment
);
postRoutes.put("/:postId/comments/:commentId", authenticateToken, editComment);
postRoutes.delete(
  "/:postId/comments/:commentId",
  authenticateToken,
  deleteComment
);

export default postRoutes;

