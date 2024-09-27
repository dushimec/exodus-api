import mongoose, { Schema, model } from "mongoose";

const CommentSchema = new Schema({
  body: String,
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  replies: [
    {
      body: String,
      likes: { type: Number, default: 0 },
      likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  ],
});

const PostSchema = new Schema({
  title: String,
  content: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  photo: String,
  comments: [CommentSchema],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  views: { type: Number, default: 0 },
  payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
});

export default model("Post", PostSchema);
