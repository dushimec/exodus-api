import Post from "../models/post.js";
import { getDataUri } from "../utils/getDatauri.js";
import cloudinary from "cloudinary";
import { errorHandler } from "../utils/errorHandler.js";

// Create Post
const createPost = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      throw new Error("Access denied. Admin privileges required");
    }

    const file = req.file;
    console.log("uploaded photo: ", file)
    if (!file) {
      throw new Error("Please upload a photo");
    }

    const fileUri = getDataUri(file);
    const uploadResult = await cloudinary.v2.uploader.upload(fileUri.content);

    const { title, content, price, destination, tripDate, sites = '[]', trips = '[]' } = req.body;

    const parsedSites = JSON.parse(sites);
    const parsedTrips = JSON.parse(trips);

    const tripsData = await Promise.all(parsedTrips.map((trip) => {
      if (!trip.title || !trip.content || !trip.price || !trip.tripDate) {
        throw new Error("All fields (title, content, price, tripDate) are required for each trip.");
      }
      return {
        title: trip.title,
        content: trip.content,
        price: trip.price,
        tripDate: trip.tripDate,
        postImage: { public_id: uploadResult.public_id, url: uploadResult.secure_url },
      };
    }));

    let post = new Post({
      title,
      content,
      price,
      destination,
      postImage: { public_id: uploadResult.public_id, url: uploadResult.secure_url },
      author: req.user.userId,
      tripDate,
      sites: parsedSites,
      trips: tripsData,
    });

    post = await post.save();
    post = await post.populate("author", "name");

    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    return next(error);
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
    const pagination = { totalPages: Math.ceil(totalPosts / limit), currentPage: page };

    return res.json({ posts, pagination });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Posts By Destination
const getPostsByDestination = async (req, res) => {
  try {
    const { destination } = req.params;
    const posts = await Post.find({ destination }).sort({ createdAt: -1 }).populate("author", "name");
    return posts.length
      ? res.json(posts)
      : res.status(404).json({ message: "No posts found for this destination" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Edit Post
const editPost = async (req, res) => {
  try {
    if (!req.user.isAdmin) throw new Error("Access denied. Admin privileges required");

    const { sites = '[]', trips = '[]' } = req.body;
    const parsedSites = JSON.parse(sites);
    const parsedTrips = JSON.parse(trips);

    const updatedTrips = parsedTrips.map((trip) => {
      if (!trip.title || !trip.content || !trip.price || !trip.tripDate) {
        throw new Error("All fields (title, content, price, tripDate) are required for each trip.");
      }
      return trip;
    });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { ...req.body, sites: parsedSites, trips: updatedTrips },
      { new: true }
    ).populate("author", "name");

    if (!updatedPost) throw new Error("Post not found or unauthorized");

    return res.json({ updatedPost });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete Post
const deletePost = async (req, res) => {
  try {
    if (!req.user.isAdmin) throw new Error("Access denied. Admin privileges required");

    const post = await Post.findByIdAndDelete(req.params.id);
    return post
      ? res.status(200).json({ message: "Post deleted successfully" })
      : res.status(404).json({ message: "Post not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Post By ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    return post ? res.json(post) : res.status(404).json({ message: "Post not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Most Visited Posts
const getMostVisitedPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ views: -1 }).limit(5).populate("author", "name");
    return posts.length
      ? res.json(posts)
      : res.status(404).json({ message: "No posts available" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Most Liked Posts
const getMostLikedPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ likes: -1 }).limit(5).populate("author", "name");
    return posts.length
      ? res.json(posts)
      : res.status(404).json({ message: "No posts available" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUpcomingPosts = async (req, res) => {
  try {
    const today = new Date();

    // Query to get the latest 3 posts
    const lastThreePosts = await Post.find({ tripDate: { $gt: today } })
      .sort({ tripDate: 1 }) // Sort by ascending tripDate to get the nearest upcoming posts
      .limit(3); // Limit to 3 posts

    if (!lastThreePosts.length) {
      return res.status(404).json({ message: "No upcoming trips found" });
    }

    return res.json(lastThreePosts);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

// Post Comment
const postComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) throw new Error("Post not found");

    post.comments.push({ user: req.user.userId, comment });
    await post.save();

    return res.json({ message: "Comment added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Reply to Comment
const replyToComment = async (req, res) => {
  try {
    const { commentId, reply } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) throw new Error("Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    comment.replies.push({ user: req.user.userId, reply });
    await post.save();

    return res.json({ message: "Reply added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Edit Comment
const editComment = async (req, res) => {
  try {
    const { commentId, newComment } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) throw new Error("Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    comment.comment = newComment;
    await post.save();

    return res.json({ message: "Comment edited successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) throw new Error("Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    comment.remove();
    await post.save();

    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Like Post
const likeThePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) throw new Error("Post not found");

    // Check if the user has already liked the post
    if (post.likes.includes(req.user.userId)) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

    // Add user ID to likes and increment like count
    post.likes.push(req.user.userId);
    post.likeCount = (post.likeCount || 0) + 1; // Increment like count

    await post.save();

    return res.json({ message: "Post liked successfully", post });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Export all handlers
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
  getUpcomingPosts,
};
