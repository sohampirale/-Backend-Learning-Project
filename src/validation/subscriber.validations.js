import { z } from "zod";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const subscribeChannelValidation = z.object({
    channelId: z
        .string()
        .min(4)
        .max(1000)
        .refine((channelId) => ObjectId.isValid(channelId), {
            message: "Invalid Channel Id",
        })
        .transform((channelId) => new ObjectId(channelId)),
});

const unsubscribeChannelValidation = z.object({
    channelId: z
        .string()
        .min(4)
        .max(1000)
        .refine((channelId) => ObjectId.isValid(channelId), {
            message: "Invalid Channel Id",
        })
        .transform((channelId) => new ObjectId(channelId)),
});

export { subscribeChannelValidation, unsubscribeChannelValidation };
