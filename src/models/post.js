import mongoose, { Schema, model } from "mongoose";

const CommentSchema = new Schema(
  {
    body: { type: String, required: true }, // Ensure body is required
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        body: { type: String, required: true }, // Ensure body is required
        likes: { type: Number, default: 0 },
        likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const PostSchema = new Schema(
  {
    title: { type: String, required: true }, // Ensure title is required
    content: { type: String, required: true }, // Ensure content is required
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure author is required
    },
    photo: { type: String }, // Optional
    galleryPhotos: [{ type: String }], // Optional
    destination: { type: String }, // Optional; consider using enum if predefined
    comments: [CommentSchema],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    price: { type: Number, required: true }, // Ensure price is required
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

export default model("Post", PostSchema);
