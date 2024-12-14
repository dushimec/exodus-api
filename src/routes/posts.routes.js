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
} from "../controllers/postController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { multipleUpload, singleUpload } from "../utils/multer.js";

// Post routes
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


/**
 * @swagger
 * /posts/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of images to upload
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /posts/{postId}/comment:
 *   post:
 *     summary: Comment on a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Content of the comment
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /posts/{postId}/like/{commentId}:
 *   put:
 *     summary: Like a post or a comment on a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: path
 *         name: commentId
 *         required: false
 *         schema:
 *           type: string
 *         description: (Optional) ID of the comment to like
 *     responses:
 *       200:
 *         description: Liked successfully
 *       404:
 *         description: Post or comment not found
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of posts
 */

/**
 * @swagger
 * /posts/destination/{destination}:
 *   get:
 *     summary: Get posts by destination
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination to filter posts by
 *     responses:
 *       200:
 *         description: A list of posts filtered by destination
 */

/**
 * @swagger
 * /posts/most-visited:
 *   get:
 *     summary: Get the most visited posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of the most visited posts
 */

/**
 * @swagger
 * /posts/most-liked:
 *   get:
 *     summary: Get the most liked posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of the most liked posts
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Edit a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}/replies:
 *   post:
 *     summary: Reply to a comment on a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reply:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   put:
 *     summary: Edit a comment on a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated comment content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment on a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
