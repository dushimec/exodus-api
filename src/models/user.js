import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    profile: {
      public_id: { type: String, required: false },
      url: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
export default User;
