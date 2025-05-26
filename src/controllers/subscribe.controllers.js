import {z} from "zod"
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";
const ObjectId=mongoose.Types.ObjectId;

//models
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js";
import { userSignup } from "./user.controllers.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * 1.fetch the channelId and convert it to ObjectId from the req.body.channelId
 * 2.(if channel not found) -> throw error : Channel not found
 * 3. create a new obj called subscription where subscriber = req.user._id and channel = channel._id
 * 4.return response
 */
const subscribeChannel=asyncHandler(async(req,res)=>{
    const {channelId} =req.body.channelId;

    const channel= await User.exists({
        _id:channelId
    })

    if(!channel){
        throw new ApiError(400,'Channel not found - failed to subscribe to the channel');
    }

    if(await Subscription.exists({
        subscriber:req.user._id,
        channel:channelId
    })){
        throw new ApiError(400,'You have already subscribed to this channel - cannot subscribe again');
    }

    try{
        const subscription = await Subscription.create({
            subscriber:req.user._id,
            channel:channelId
        })
    } catch(err){
        throw new ApiError(400,'Failed to create document',err);
    }
    
    return res.status(200).json(
        new ApiResponse(200,`Subscribed to this channel successfully`)
    )
})


/**
 * 1.fetch the channelId and convert it to ObjectId
 * 2.(if subscription document does not exist with that subscriber and channel) 
 *      -> throw error : "You have not subscribed to this channel - cannot unsubscribe"
 * 3.(else) use findOne and delete the document from the db and 
 * 4.return response
 */

const unsubscribeChannel= asyncHandler(async(req,res)=>{
    const {channelId} = req.body;

    const subscription = await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    });

    if(!subscription){
        throw new ApiError(404,'You have not subscribed this channel - failed to unsubscribe')
    }
    
    await subscription.deleteOne();
    return res.status(200).json(
        new ApiResponse(200,'Channel unsubscribed successfully')
    )
})

export {subscribeChannel,unsubscribeChannel}