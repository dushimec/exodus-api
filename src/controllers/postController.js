import Post from "../models/post.js";
import { getDataUri } from "../utils/getDatauri.js";
import cloudinary from "cloudinary";
import { errorHandler } from "../utils/errorHandler.js";
import { cloudinaryUploadFromBuffer } from "../utils/cloudinary.js";

// Create Post
const createPost = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      throw new Error("Access denied. Admin privileges required");
    }

    const { title, destination, price, currency, postDate, content, sites, trips } = req.body;
    const file = req.file;

    // Basic validation
    if (!title || !destination || !price || !postDate || !content) {
      return res.status(400).json({ message: "Please fill out all required fields." });
    }

    let imageUrl = '';
    let imagePublicId = '';
    if (file) {
      const fileUri = getDataUri(file);
      const cloudinaryResponse = await cloudinary.v2.uploader.upload(fileUri.content);
      imageUrl = cloudinaryResponse.secure_url;
      imagePublicId = cloudinaryResponse.public_id;
    }

    // Parse sites and validate tripDate
    const parsedSites = JSON.parse(sites || '[]').map(site => {
      if (!site.name || !site.siteDate) {
        throw new Error("All fields (name, siteDate) are required for each site.");
      }
      return site;
    });

    // Parse trips
    const parsedTrips = JSON.parse(trips || '[]');

    // Create new post object
    const newPost = {
      title,
      destination,
      price,
      currency,
      postDate,
      content,
      author: req.user.userId,
      sites: parsedSites,
      trips: parsedTrips.map(trip => ({
        ...trip,
        postImage: imageUrl ? [{ public_id: imagePublicId, url: imageUrl }] : []
      })),
      postImage: imageUrl ? [{ public_id: imagePublicId, url: imageUrl }] : []
    };

    // Save post to database
    const post = await Post.create(newPost);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const parsedSites = JSON.parse(sites).map(site => {
      if (!site.name || !site.siteDate) {
        throw new Error("All fields (name, siteDate) are required for each site.");
      }
      return site;
    });
    const parsedTrips = JSON.parse(trips);
    const file = req.file;

    const updatedTrips = parsedTrips.map((trip) => {
      if (!trip.title || !trip.content || !trip.price || !trip.tripDate) {
        throw new Error("All fields (title, content, price, tripDate) are required for each trip.");
      }
      return { ...trip, image: file?.path || '' }; // Assign the image to each trip
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

// Get Upcoming Posts
const getUpcomingPosts = async (req, res) => {
  try {
    const latestPosts = await Post.find()
      .sort({ tripDate: -1 }) 
      .limit(3); 

    if (!latestPosts.length) {
      return res.status(404).json({ message: "No upcomming posts found" });
    }

    return res.json(latestPosts);
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

    if (post.likes.includes(req.user.userId)) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

    post.likes.push(req.user.userId);
    post.likeCount = (post.likeCount || 0) + 1;

    await post.save();

    return res.json({ message: "Post liked successfully", post });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get Post Performance Overview
const getPostPerformanceOverview = async (req, res) => {
    try {
        const totalPosts = await Post.countDocuments();
        const mostVisitedPosts = await Post.find().sort({ views: -1 }).limit(5).populate("author", "name");
        const mostLikedPosts = await Post.find().sort({ likes: -1 }).limit(5).populate("author", "name");
        const upcomingPosts = await Post.find({ tripDate: { $gt: new Date() } }).sort({ tripDate: -1 }).limit(3).populate("author", "name");

        res.status(200).json({
            totalPosts,
            mostVisitedPosts,
            mostLikedPosts,
            upcomingPosts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
  getPostPerformanceOverview,
};
