// import {asyncHandler} from "./asyncHandler.js";
// import {Subscriptions} from "../models/subscription.models.js";
// import {User} from "../models/user.models.js"

// const findNoOfSubscribersAndSubscriptions=asyncHandler(async(id)=>{
//     const info=User.aggregate([
//         {
//             $match:{
//                 _id:id
//             }
//         }
//         ,{
//             $lookup:{
//                 from:"subscriptions",
//                 localField:"_id",
//                 foreignField:"channel",
//                 as:"subscribers"
//             }
//         },{
//             $lookup:{
//                 from:"subscriptions",
//                 localField:"_id",
//                 foreignField:"subscriber",
//                 as:"subscriptions"
//             }
//         },{
//             $project:{
//                 _id:1,
//                 username:1,
//                 email:1,
//                 avatar:1,
//                 coverImage:1,
//                 subscribersCount:subscribers.size,
//                 subscriptionsCount:subscriptions.size
//             }
//         }
//     ]);
//     return info
// })