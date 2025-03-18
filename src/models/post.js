import mongoose, { Schema, model } from "mongoose";

// Define CommentSchema to be embedded in the PostSchema
const CommentSchema = new Schema(
  {
    body: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        body: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
  },
  { timestamps: true }
);

// Define TripSchema to be embedded in the PostSchema
const TripSchema = new Schema(
  {
    title: { type: String, required: true }, // Title of the trip
    content: { type: String, required: true }, // Description of the trip
    price: { type: Number, required: true }, // Price for the trip
    tripDate: { type: Date, required: true }, // Date for the trip
    postImage: [
      {
        public_id: { type: String, required: false },
        url: { type: String, required: false },
      },
    ], // Photos related to the trip
  },
  { timestamps: true }
);

// Define PostSchema
const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postImage: [
      {
        public_id: { type: String, required: false },
        url: { type: String, required: false },
      },
    ], // Photos related to the post

    destination: {
      type: String,
      enum: ["Israel", "Egypt", "Turkey", "Rwanda"], // Allowed destination options
      required: true,
    },

    // **Updated Sites Structure**: Store site name and trip date
    sites: [
      {
        name: { type: String, required: true }, // Name of the site
        siteDate: { type: Date, required: true }, // Date for the visit to this site
      },
    ],
    currency:{
      type: String,
    },
    // **Embedded Comments** (Can be added later)
    comments: [CommentSchema], // Array of comments for the post

    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },

    price: { type: Number, required: true }, // Price for the tour

    postDate: { type: Date, required: true }, // Trip date for the main post

    // **Updated Trips Structure**: Each trip can have multiple photos and other details
    trips: [TripSchema], // Array of trips associated with the destination
  },
  { timestamps: true }
);

export default model("Post", PostSchema);
