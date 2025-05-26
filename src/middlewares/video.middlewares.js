import { asyncHandler } from "../utils/asyncHandler.js";

import {Video} from "../models/video.models..js"
import { ApiError } from "../utils/ApiError.js";

const videoOwnershipMiddleware=asyncHandler(async(req,res,next)=>{
    //auth middleware and videoId validation middleware needs to be applied before this 
    const userId=req.user?._id;
    if(!userId){
        next(new ApiError(404,'User Id not found'));
    }
    const video = await Video.findById(req.body.videoId);
    if(!video){
        throw new ApiError(404,'Video not found');
    }
    if(video.owner!==userId){
        next(new ApiError(400,'Unable to perfrom this action on video from different channel'));
    } 
    next();
})

export {videoOwnershipMiddleware}