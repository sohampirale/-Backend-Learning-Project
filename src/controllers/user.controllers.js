//dependancies
import { z } from "zod";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import jwt from "jsonwebtoken"

//models
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
//utils
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FIVE_MINUTES } from "../constants.js";
import { returnUser } from "../utils/returnUser.js";
import { generateAccessAndRefreshToken } from "../utils/genereateAccessAndRefreshToken.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
//constants
import { cookieOptions } from "../constants/options.js";

//constants
import { tr } from "zod/v4/locales";

const userSignup = asyncHandler(async (req, res, next) => {
    console.log("inside userSignup");
    console.log("req.body = " + JSON.stringify(req.body));
    console.log("req.file = " + JSON.stringify(req.file));

    const reqBody = z.object({
        username: z.string().min(3).max(100),
        email: z.string().email().min(5).max(100),
        fullname: z.string().min(4).max(100),
        password: z.string(),
    });

    const parsedBody = reqBody.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(401).json({
            message: "Insufficient/Incorrect data provided",
            error: parsedBody.error,
        });
    }

    const { username, fullname, password, email } = parsedBody.data;
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        return res.status(401).json({
            message: "Failed to get path of the avatar file",
        });
    }

    const response = await uploadFileOnCloudinary(avatarLocalPath);
    const user = await User.create({
        username,
        email,
        fullName: fullname,
        password,
        avatar: response.url,
    });

    res.status(200).json({
        message: "Signup successfull",
    });
});

/* Methodology
 * get username/email && password
 * check if the user already exists with that username/password
 * fetch the user
 * if user has unsuccessattempts >5
 *   1.If the Date.now - unsucessfult attempts time >5
 *       i.Initialize the unsuccessfull attempts = 0
 *       ii.Let the user try again to login
 *   2.If date.now - unsuccessattempts startTime <5
 *       i.Do not allow user to login
 * compare the password
 * on correct pw
 *   1.generate token and access token
 *   2.store refresh token in db
 *   3.If unsuccessfull attempts are there -> initialize them to 0 and remove the firstFailedLoginAt to null
 *   3.send back access token and refresh token to frontend
 * on incorrect pw
 *   1.Increase no of unsuccessfull attempts of that user
 *   2.If unsuccessfull attempts are 0
 *       i.set unsuccessful attempt start time = Date.now
 *       ii.Increase the unsuccessfull attempts to 1
 *       iii.Return response
 */

const loginUser = async (req, res) => {
    const reqBody = z.object({
        username: z.string().max(25).optional(),
        email: z.string().email().max(100).optional(),
        password: z
            .string()
            .min(8)
            .max(100)
            .refine((val) => /[a-z]/.test(val))
            .refine((val) => /[A-Z]/.test(val))
            .refine((val) => /[0-9]/.test(val))
            .refine((cal) => /[\W_]/.test(val)),
    });
    const parsedBody = reqBody.safeParse(req.body);
    if (!parsedBody.success) {
        return new ApiError(
            403,
            "Insufficient/Incorrect data provided",
            parsedBody.error,
        );
    }

    const { username, email, password } = req.body;
    const query = username ? { username } : email ? { email } : null;
    if (query) {
        return ApiError(403, "Username or Email is required to login");
    }
    const user = await User.findOne(query).collation({
        locale: "en",
        strength: 2,
    });
    if (!user) {
        return new ApiError(
            404,
            `User with that ${query.email ? "email" : "username"} does not exist`,
        );
    }

    if (user.unsuccessfulAttempts >= 5) {
        if (user.firstFailedLoginAt - Date.now().getTime() < FIVE_MINUTES) {
            return res.status(403).json({
                message:
                    "Too many unsuccessfull attempts try again after 5 minutes",
            });
        } else {
            user.unsuccessfulAttempts = 0;
            user.firstFailedLoginAt = null;
            await user.save();
        }
    }

    if (await user.comparePassword(password)) {
        if (user.unsuccessfulAttempts != 0) {
            user.unsuccessfulAttempts = 0;
            user.firstFailedLoginAt = null;
        }

        const payload = {
            _id: user._id,
            username: user.username,
        };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        user.refreshToken = refreshToken;

        await user.save({ validationBeforeSave: false });
        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", refreshToken)
            .json({
                message: "Login Successfull",
                token,
                refreshToken,
                user: returnUser(user),
            });
    } else {
        if (user.unsuccessfulAttempts == 0) {
            user.firstFailedLoginAt = Date.now();
        }
        user.unsuccessfulAttempts++;
        await user.save();
        return ApiError(
            403,
            `Incorrect Password you have ${5 - user.unsuccessfulAttempts} more attempts`,
        );
    }
};

const checkDuplicate = asyncHandler(async (value, checkType) => {
    const isEmail = checkType ? checkType === "email" : null;
    const query = isEmail ? { email: value } : { username: value };
    const user = await User.findOne(query)
        .collation({ locale: "en", strength: 2 })
        .exec();
    if (user) {
        res.json({
            exists: true,
            message: `User with that ${isEmail ? "email" : "username"} already exists`,
        });
    } else {
        res.json({
            exists: true,
            message: `User with that ${isEmail ? "email" : "username"} does not exist`,
        });
    }
});

/* Methodology
 *  1.fetch the access token
 *  2.try to verify access token
 *  (if access tokne not found) retunr ApiErrror ->unauthorized
 *  (if access token expired) ->
 *                i.(if refresh token not found) -> Unauthorized probnaly danger
 *                ii.fetch user from DB & verify the refresh token (refreshtoken->decode->_id->User.findById->user)
 *                    1.(if refrsh token expired) -> Unauthorized & -> send them back to login page
 *                    2.(if refresh token is same(compared)) -> generate new access token and refresh token
 *                    3.save the user and add user to the req obj
 *   user in the req.user
 *  fetch user from db
 *  remove the refresh token from it and save it
 *  remove accesToken and refresh token from cookies
 *  return the response
 */

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        ureq.user._id,
        {
            refreshToken: undefined,
        },
        {
            new: true,
            runValidators: true,
        },
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "Logout successfull"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.headers?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized : Refresh Token not found");
    }
    try {
        const decodedFromRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );
        const payload = {
            _id: decodedFromRefreshToken._id,
            username: decodedFromRefreshToken._id,
        };
        const { accessToken, refreshToken } =
            generateAccessAndRefreshToken(payload);

        await User.findByIdAndUpdate(decodedFromRefreshToken._id, {
            refreshToken,
        });

        res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(200, "Access token refresh successfully", {
                    accessToken,
                    refreshToken,
                }),
            );
    } catch (error) {
        throw new ApiError(400, "Unauthorized : Refresh token used or invalid");
    }
});

/* Methodology
1.Use authMiddleware (accessToken check)
2.Extract oldPassword and newPassword -> (use Zod)
3.fetch user from DB
4.Compare oldPassword===user.password -> use User.comparePassword 
5. if incorrect --> throw new ApiError
   if Correct -->
      i.  generate new accessToken and refreshToken 
      ii. store new refreshToken and new Password in the user
      iii.user.save
      iv.set cookies to res obj
      v.return success message
*/

const changePassword = asyncHandler(async (req, res) => {
    const reqBody = z.object({
        oldPassword: z
            .string()
            .min(8)
            .max(100)
            .refine((val) => /[A-Z]/.test(val))
            .refine((val) => /[a-z]/.test(val))
            .refine((val) => /[0-9]/.test(val))
            .refine((val) => /[\W_]/.test(val)),
        newPassword: z
            .string()
            .min(8)
            .max(100)
            .refine((val) => /[A-Z]/.test(val))
            .refine((val) => /[a-z]/.test(val))
            .refine((val) => /[0-9]/.test(val))
            .refine((val) => /[\W_]/.test(val)),
    });

    const parsedBody = reqBody.safeParse(req.body);
    if (!parsedBody.success) {
        throw new ApiError(403, "Invalid/Incorrect Data provided");
    }
    const { oldPassword, newPassword } = parsedBody.data;
    if (oldPassword === newPassword) {
        throw new ApiError(
            403,
            "New Password cannot be same as Current Password",
        );
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found!");
    }
    if (await user.comparePassword(oldPassword)) {
        const payload = {
            _id: user._id,
            username: user.username,
        };
        const { accessToken, refreshToken } =
            generateAccessAndRefreshToken(payload);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return res.status(200);
        cookie("accessToken", accessToken, cookieOptions);
        cookie("refreshToken", refreshToken, cookieOptions).json(
            new ApiResponse(200, "Password changed successfully", {
                accessToken,
                refreshToken,
            }),
        );
    } else {
        throw new ApiError(402, "Incorrect Password");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Current user fetched successfully", req.user),
        );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const user = req.user;
    const updatedData = {
        username: req.body ? req.body.username : user.username,
        fullName: req.body.fullName ? req.body.fullName : user.fullName,
        email: req.body.email ? req.body.email : user.email,
    };
    const reqUpdates = z.object({
        username: z.string().min(4).max(100),
        fullName: z.string().max(100),
        email: z.string().email().min(5).max(100),
    });

    const parsedData = reqUpdates.safeParse(updatedData);
    if (!parsedData.success) {
        throw new ApiError(
            400,
            "Insufficient/Invalid data sent - failed to update the user details",
        );
    }
    const { username, fullName, email } = parsedData.data;

    const newAvatarLocalPath = req.files?.avatar
        ? req.files.avatar[0].path
        : null;
    const newCoverImageLocalPath = req.files?.coverImage
        ? req.files.coverImage[0].path
        : null;
    let avatarUrl, coverImageUrl;

    if (newAvatarLocalPath) {
        const response = await uploadFileOnCloudinary(newAvatarLocalPath);
        if (response) {
            avatarUrl = response.url;
        } else {
            throw new ApiError(
                400,
                "Failed to upload conver image on cloudinary",
            );
        }
    }

    if (newCoverImageLocalPath) {
        const response = await uploadFileOnCloudinary(newCoverImageLocalPath);
        if (response) {
            coverImageUrl = response.url;
        } else {
            throw new ApiError(
                400,
                "Failed to upload avatar image on cloudinary",
            );
        }
    }
    let updatedUser = null;
    try {
        updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                username,
                fullName,
                email,
                avatar: avatarUrl ? avatarUrl : user.avatar,
                coverImage: coverImageUrl ? coverImageUrl : user.coverImage,
            },
            {
                new: true,
            },
        ).select(
            "-password -refreshToken -unsuccessfulAttempts -firstFailedLoginAt -watchHistory",
        );

        if (!updatedUser) {
            throw new ApiError(400, "Failed to update user details");
        }
    } catch (err) {
        throw new ApiError(
            400,
            "Failed to update user details",
            err.message ? err : "Something went wrong",
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User details updated successfully",
                updatedUser,
            ),
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarImagePath = req.file?.path;

    if (!avatarImagePath) {
        throw new ApiError(403, "Avatar image not found");
    }

    const response = await uploadFileOnCloudinary(avatarImagePath);
    if (!response || !response.url) {
        throw new ApiError(400, "Failed to upload image on cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: response.url,
            },
        },
        {
            new: true,
            runValidators: true,
        },
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(400, "Failed to update the avatar - User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar updated successfully"));
});

/*
  1.parse it
  2.check if atleast channelId or channelUsername exists
  -->User needs
      i.No of subscribers of that channel 
      ii.NO of channels that channel is subscribing
      iii.Channel inof -> name,avatar,coverimage
      iv.videos
  3.fetch that channel .select("-password -refreshToken")
  4.figure out no of subscribors and no of channels it is subscribing
  5.return the response
*/
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const reqQuery = z.object({
        channelId: z.string().min(4),
    });
    const parsedQuery = reqQuery.safeParse(req.query);
    if (!parsedQuery.success) {
        throw new ApiError(
            400,
            "Insufficient/Invalid data sent - Failed to get Channel Data",
        );
    }

    const { channelId } = parsedQuery.data;
    try {
        const info = await User.aggregate([
            {
                $match: {
                    _id: new ObjectId(channelId),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscriptions",
                },
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: { $size: "$subscribers" },
                    subscriptionsCount: { $size: "$subscriptions" },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
        ]);
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Use data fetched successfully", info[0]),
            );
    } catch (err) {
        throw new ApiError(400, "Filed to get data about a User", err);
    }
});

/* get watch history of the user 
1.match user with _id
2.$lookup on the watchistory from "videos" schema
3.$lookup for the owner of every video fetched inside the array of wactchedVideos
4.$project
*/
const getUserWatchHistory = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const user = await User.aggregate([
        {
            $match: {
                _id,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        channelId: _id,
                                        _id: 0,
                                        channelName: fullName,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                    {
                        $project: {
                            videoId: _id,
                            _id: 0,
                            title: 1,
                            description: 1,
                            duration: 1,
                            thumbnail: 1,
                            owner: 1,
                            views: 1,
                            isPublished: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 0,
                watchedVideos: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User watch history fetched successfully",
                user[0].watchedVideos,
            ),
        );
});

/* 
1.we would need to delete all the data of the user from all the different models
2.all the tweets he has made 
3.all the videos he has uploaded
4.all the commments he had made
soln add one boolean to every document whether it is published or not and while deleting just make sure we turn the isPublished to false
//ask chatgpt for industry level approach
we can add this betetr when we complete all controllers probably
*/
const deleteUserAccount = asyncHandler(async (req, res) => {});

/**
 * 1.get the videoId
 * 2.compare and find the videoId in the watchHistory array of user
 *  (if not found) --> throw an error => "Video not found"
 * 3.delete it from the array
 * 4.save the user
 * 5.response
 */

const removeVideoFromWatchHistory = asyncHandler(async (req, res) => {
    const reqBody = z.object({
        videoId: z.string(),
    });
    const parsedBody = reqBody.safeParse(req.body);
    if (!parsedBody.success) {
        throw new ApiError(400, "Invalid videoId sent");
    }
    const { videoId } = parsedBody.data;

    const index = req.user.watchHistory.findIndex(
        (id) => id.toString() === videoId.toString(),
    );

    if (index !== -1) {
        req.user.watchHistory.splice(index, 1); 
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id,{
        watchHistory:req.user.watchHistory
    })

    return res.status(200).json(
        new ApiResponse(200,'Request video removed from the watch History',updatedUser.watchHistory)
    );
});

export {
    userSignup,
    loginUser,
    checkDuplicate,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    getUserChannelProfile,
    getUserWatchHistory,
};