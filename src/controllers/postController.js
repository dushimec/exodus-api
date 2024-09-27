import Post from "../models/post.js";
import { getDataUri } from "../utils/getDatauri.js";
import cloudinary from "cloudinary";

const createPost = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Please upload a photo" });
    }

    const fileUri = getDataUri(file);
    const cloudinaryResult = await cloudinary.v2.uploader.upload(fileUri.content);

    const { title, content } = req.body;
    const userId = req.user.userId;

    let post = new Post({
      title,
      content,
      photo: cloudinaryResult.secure_url,
      author: userId,
      comments: [],
      likes: 0,
    });

    post = await post.save();
    post = await post.populate("author", "name");

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("author", "name");

    const totalPosts = await Post.countDocuments();

    const pagination = {
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    };

    res.json({ posts, pagination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editPost = async (req, res) => {
  const id = req.params.id;
  try {

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: id, author: req.user.userId },
      { $set: req.body },
      { new: true }
    ).populate("author", "name");

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    res.json({ updatedPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  const id = req.params.id;
  try {

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }
    const deletedPost = await Post.findOneAndDelete({
      _id: id,
      author: req.user.userId,
    });

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { body } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not" });
    }

    post.comments.push({ body, likes: 0 });
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { body } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (!comment.replies || !Array.isArray(comment.replies)) {
      comment.replies = [];
    }

    const newReply = {
      body,
      likes: 0,
    };

    comment.replies.push(newReply);
    await post.save();

    res.status(201).json({ message: "Reply added successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { body } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.body = body;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likeThePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { type, commentId } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // For post likes/unlikes
    if (type === "post") {
      const hasLiked = post.likedBy.includes(userId);

      if (hasLiked) {
        // Unlike the post
        post.likes -= 1;
        post.likedBy = post.likedBy.filter((user) => user.toString() !== userId);
      } else {
        // Like the post
        post.likes += 1;
        post.likedBy.push(userId);
      }
    } else if (type === "comment") {
      // For comment likes/unlikes
      const comment = post.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const hasLikedComment = comment.likedBy.includes(userId);

      if (hasLikedComment) {
        // Unlike the comment
        comment.likes -= 1;
        comment.likedBy = comment.likedBy.filter((user) => user.toString() !== userId);
      } else {
        // Like the comment
        comment.likes += 1;
        comment.likedBy.push(userId);
      }
    } else {
      return res.status(400).json({ error: "Invalid like type" });
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getMostLikedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ likes: -1 })
      .limit(10)
      .populate("author", "name");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id).populate("author", "name");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postWithUpdatedViews = { ...post._doc, views: post.views + 1 };

    res.json({ post: postWithUpdatedViews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMostVisitedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ views: -1 })
      .limit(10)
      .populate("author", "name");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePostById = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedPost = await Post.findOneAndDelete({ _id: id });

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePostById = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    ).populate("author", "name");

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ updatedPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createPost,
  getPosts,
  editPost,
  deletePost,
  postComment,
  replyToComment,
  editComment,
  deleteComment,
  likeThePost,
  getMostLikedPosts,
  getPostById,
  getMostVisitedPosts,
  deletePostById,
  updatePostById,
  getAllPosts,
};
