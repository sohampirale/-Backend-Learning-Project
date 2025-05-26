import { Video } from "../models/video.models.js";
import {User} from "../models/user.models.js"

//utils
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";

/*
 * 1.fetch data + views = 0
 * 2.figure out whether that user already has uploaded the video with that same title
 * 3.if yes throw error
 * 4.if not upload the video and thumbnail on cloudinary
 * 5.create the video document
 * 6.return the video document
 */

const uploadVideo = asyncHandler(async (req, res, next) => {
    const { title, description, isPublished } = req.body;
    const views = 0;
    const videoPath = req.files?.video?.path;
    const thumbnailPath = req.files?.thumbnail?.path;
    if (!videoFile) {
        throw new ApiError(404, "Video file not found");
    }
    if (!thumbnail) {
        throw new ApiError(404, "Thumbnail not found");
    }

    if (
        await Video.exists({
            title,
            owner: req.user._id,
        })
    ) {
        throw new ApiError(400, "With video that title already exists");
    }
    try {
        const uploadedVideo = await uploadFileOnCloudinary(videoPath);
        if (!uploadedVideo) {
            throw new ApiError(500, "Failed to uplod video");
        }
        const uploadedThumbnail = await uploadFileOnCloudinary(thumbnailPath);
        if (!uploadedThumbnail) {
            throw new ApiError(500, "Failed to uplod thumbnail");
        }

        const video = await Video.create({
            videoFile:uploadedVideo.url,
            thumbnail:uploadedVideo.url,
            title,
            description,
            duration: uploadedVideo.duration,
            views: 0,
            isPublished,
        });

        return res.status(200).json(
            new ApiResponse(200,'Video uploaded successfully',video)
        )

    } catch (error) {
        next(error);
    }
    
});

/*
 * 1.fetch validated videoId
 * 2.see if video already uploded by user(req.user._id)
 * 3.If not then throw error video not uploaded
 * 4.find the document and delete it 
 */
const deleteVideo = asyncHandler(async(req,res,next)=>{
    const {videoId} = req.params;

    const video = await Video.findOne({
        owner:req.user._id,
        _id:videoId
    })
    if(!video){
        throw new ApiError(404,'Video not found');
    }
    await video.deleteOne();
    return res.status(200).json(
        new ApiResponse(200,'Video deleted successfully')
    )
})

const updateVideoDetails=asyncHandler(async(req,res,next)=>{
    const {description,title,isPublished,videoId} = req.body;
    const thumbnailPath = req.file?.thumbnail;
    let thumbnail=null;

    if(thumbnailPath){
        thumbnail= await uploadFileOnCloudinary(thumbnailPath);
    }

    const existingVideo = await Video.findById(videoId);
    if(!existingVideo){
        throw new ApiError(404,'Video not found')
    }

    existingVideo.description=description;
    existingVideo.title=title;
    existingVideo.isPublished=isPublished;
    if(thumbnail){
        existingVideo.thumbnail=thumbnail.url
    }
    await existingVideo.save();
    return res.status(200).json(
        new ApiResponse(200,'Video details updated successfully')
    )
})

const getVideoDetails=asyncHandler(async(req,res,next)=>{
    const {videoId}=req.params;

    const video = await Video.aggregate([
        {
            $match:{
                _id:videoId
            }
        },{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        ownerId:"$_id",
                        ownerUsername:"$username",
                        ownerFullname :"$fullName",
                        _id:0,
                        avatar:1
                    }
                }]
            }
        },{
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },{
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes",
              
            }
        },{
            $addFields:{
                likes:{
                    $size:"$likes"
                }
            }
        }
    ])

    if(!video){
        throw new ApiError(404,'Video not found')
    }
    return res.status(200).json(
        new ApiResponse(200,'Video fetched successfully',video[0])
    )
})

const unpublishVideo=asyncHandler(async(req,res,next)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    if(!videoId){
        throw new ApiError(404,'Video not found');
    }

    if(!video.isPublished){
        throw new ApiError(400,'Video is already unpublished');
    }

    video.isPublished=false;
    return res.status(200).json(
        new ApiResponse(200,'Video unpublished successfully')
    )
})

const publishVideo=asyncHandler(async(req,res,next)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);

    if(!videoId){
        throw new ApiError(404,'Video not found');
    }

    if(video.isPublished){
        throw new ApiError(400,'Video is already published');
    }

    video.isPublished=true;
    return res.status(200).json(
        new ApiResponse(200,'Video unpublished successfully')
    )
})

export {
    uploadVideo,
    deleteVideo,
    updateVideoDetails,
    getVideoDetails,
    unpublishVideo,
    publishVideo
}