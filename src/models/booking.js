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
      ref: "User",
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
      
    },
    phone: {
      type: String,
      
    },
    travelers: { type: Number, default: 1 },
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
