import {z} from "zod"
import Video from "../models/video.models";
import mongoose from "mongoose";
const ObjectId=mongoose.Types.ObjectId;

const uploadVideoValidation=z.object({
    title:z.string().max(150),
    desciption:z.string().max(5000).optional(),
    isPublished:z.boolean()
})

const updateVideoDetailsValidation=z.object({
    desciption:z.string().min(0).max(5000),
    title:z.string().max(150),
    isPublished:z.boolean(),
    videoId:z.string()
        .refine(videoId=>ObjectId.isValid(videoId),{
            message:"Invalid Video Id"
        })
        .transform(videoId=>new ObjectId(videoId))

})

const videoIdValidation= z.object({
    videoId:z.string()
        .refine(videoId=>ObjectId.isValid(videoId),{
            message:"Invalid Video Id"
        })
        .transform(videoId=>new ObjectId(videoId))
})

export {uploadVideoValidation,updateVideoDetailsValidation,videoIdValidation};