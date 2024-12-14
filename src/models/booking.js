import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
      required: true,
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "canceled"],
      default: "pending",
    },
    date: {
      type: Date,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    travelers: { type: Number, default: 1 },
    tripSite: { type: String, required: true },
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
