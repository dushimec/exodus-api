import { Router } from "express";
const postRoutes = Router();

import {
  postComment,
  createPost,
  getPosts,
  likeThePost,
  getPostById,
  deletePostById,
  updatePostById,
  replyToComment,
  editComment,
  deleteComment,
  getMostVisitedPosts,
  getMostLikedPosts,
} from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { singleUpload } from "../utils/multer.js";

// Post routes
postRoutes.post("/create", authenticateToken, singleUpload, createPost);
postRoutes.post("/:postId/comment", authenticateToken, postComment);
postRoutes.put("/:postId/like", authenticateToken, likeThePost);
postRoutes.get("/", getPosts);
postRoutes.get("/most-visited", getMostVisitedPosts);
postRoutes.get("/most-liked", getMostLikedPosts);
postRoutes.get("/:id", authenticateToken, getPostById);
postRoutes.delete("/:id", authenticateToken, deletePostById);
postRoutes.put("/:id", authenticateToken, updatePostById);
postRoutes.post(
  "/:postId/comments/:commentId/replies",
  authenticateToken,
  replyToComment
);
postRoutes.put(
  "/posts/:postId/comments/:commentId",
  authenticateToken,
  editComment
);
postRoutes.delete(
  "/posts/:postId/comments/:commentId",
  authenticateToken,
  deleteComment
);

export default postRoutes;
