import { Schema, model } from "mongoose";

const PaymentSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  }, { timestamps: true });
  
  export default model('Payment', PaymentSchema);
  