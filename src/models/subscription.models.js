import mongoose, { Schema } from "mongoose";
import { required } from "zod/v4-mini";

const ObjectId = Schema.Types.ObjectId;

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: ObjectId,
      ref: "User",
      required:true
    },
    channel: {
      type: ObjectId,
      ref: "User",
      required:true
    },
  },
  {
    timestamps: true,
  },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
