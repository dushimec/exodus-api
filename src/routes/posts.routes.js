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
} from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { multipleUpload, singleUpload } from "../utils/multer.js";

// Post routes
postRoutes.post("/create", authenticateToken, multipleUpload, createPost);
postRoutes.post("/:postId/comment", authenticateToken, postComment);
postRoutes.put("/:postId/like/:commentId?", authenticateToken, likeThePost);
postRoutes.get("/", getPosts);
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
