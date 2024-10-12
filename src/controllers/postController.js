import Post from "../models/post.js";
import { getDataUri } from "../utils/getDatauri.js";
import cloudinary from "cloudinary";


// Create Post
const createPost = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }

    const files = req.files; 
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one photo" });
    }

    const { title, content, price, destination } = req.body; 
    const { userId } = req.user;

    const mainPhotoUri = getDataUri(files[0]);
    const mainPhotoResult = await cloudinary.v2.uploader.upload(mainPhotoUri.content);

    const galleryPhotos = await Promise.all(
      files.slice(1).map(async (file) => {
        const fileUri = getDataUri(file);
        const result = await cloudinary.v2.uploader.upload(fileUri.content);
        return result.secure_url;
      })
    );

    let post = new Post({
      title,
      content,
      price, 
      destination, 
      photo: mainPhotoResult.secure_url,
      galleryPhotos,
      author: userId,
      comments: [],
      likes: 0,
    });

    post = await post.save();
    post = await post.populate("author", "name");

    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get All Posts
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

    return res.json({ posts, pagination });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Posts By Destination
const getPostsByDestination = async (req, res) => {
  try {
    const { destination } = req.params;

    const posts = await Post.find({ destination })
      .sort({ createdAt: -1 })
      .populate("author", "name");

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this destination" });
    }

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Edit Post
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

    return res.json({ updatedPost });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete Post
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

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Post Comment
const postComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { body } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({ body, likes: 0 });
    await post.save();
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Reply to Comment
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

    const newReply = { body, likes: 0 };
    comment.replies.push(newReply);
    await post.save();

    return res.status(201).json({ message: "Reply added successfully", post });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Edit Comment
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
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete Comment
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
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Like/Unlike Post or Comment
const likeThePost = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (commentId) {
      const comment = post.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      comment.likes++;
      await post.save();
      return res.json(post);
    } else {
      post.likes++;
      await post.save();
      return res.json(post);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Most Visited Posts
const getMostVisitedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ visits: -1 }) // Sort by visits in descending order
      .populate("author", "name")
      .limit(10); // Limit to top 10 most visited posts

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Most Liked Posts
const getMostLikedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ likes: -1 }) // Sort by likes in descending order
      .populate("author", "name")
      .limit(10); // Limit to top 10 most liked posts

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Post By ID
const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      .populate("author", "name");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment the visits count
    post.visits++;
    await post.save();

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export {
  createPost,
  getPosts,
  getPostsByDestination,
  editPost,
  deletePost,
  postComment,
  replyToComment,
  editComment,
  deleteComment,
  likeThePost,
  getMostVisitedPosts,
  getMostLikedPosts,
  getPostById,
};
