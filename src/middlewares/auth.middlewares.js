import jwt  from "jsonwebtoken";

//utils
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { returnUser } from "../utils/returnUser.js";
import { User } from "../models/user.models.js";

//1.fetch the access token
//(if access token not found) retunr ApiErrror ->unauthorized
//2.try to verify access token
//(if access token expired) -> 
//              i.(if refresh token not found) -> Unauthorized probably danger
//              ii.fetch user from DB & verify the refresh token (refreshtoken->decode->_id->User.findById->user)
//                  1.(if refrsh token expired) -> Unauthorized & -> send them back to login page
//                  2.(if refresh token is same(compared)) -> generate new access token and refresh token
//                  3.save the user and add user to the req obj
//(if access token verified)
//              i. inside req.user. add 1._id 2.username 
//              ii.call next()

async function authMiddleware(req,res,next){
  const token=req.cookies?.accessToken||req.headers?.authorization?.startsWith('Bearer ')?auth.headers.authorization.slice(7):null;
  
  if(!token){
    return res.status(400).json({
      message:"Unauthorized - Token not found"
    })
  }

  try {
    const decodedFromAccessToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user= await User.findById(decodedFromAccessToken._id).select("-password -refreshToken");
    req.user=user;
    next();
  } catch (error) {
    if(error.name === "TokenExpiredError"){
      throw new ApiError(409,'Unauthorized : Token Expired')
    } else {
      throw new ApiError(400,"Unauthorized : Token Invalid");
    }
  }
}

async function authMiddleware2(req,res,next){
    const token = req.headers?.token;
    if(!token){
        throw new ApiError(403,'Unauthorized- Token not found');
    }

    await verifyAccessToken(req,res,next,token);
}

async function verifyAccessToken2(req, res, next, token) {
  try {
    const decodedFromAccessToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
    );
    req.user = returnUser(await User.findById(decodedFromAccessToken._id));
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      await verifyRefreshToken(req,res,next);
      return
    } else if (err.name === "JsonWebTokenError") {
      throw new ApiError(403, "Unauthorized -  Invalid Access Token");
    } else {
      throw new ApiError(403,'Error while verifying access token');
    }
  }
}

async function verifyRefreshToken2(req, res, next) {
  const refreshToken = req.body?.refreshToken;
  if (!refreshToken) {
    throw new ApiError(403, "Unauthorized - refresh token not found!");
  }

  try {
    const decodedFromRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const { _id } = decodedFromRefreshToken;
    const user = await UserActivation.findOne({
      refreshToken,
    });
    if (!user) {
      throw new ApiError(403, "User with that refreshtoken not found");
    }

    const newRefreshToken = generateRefreshToken(decodedFromRefreshToken);
    const newAccessToken = generateAccessToken(decodedFromRefreshToken);
    user.refreshToken = newRefreshToken;
    await user.save();
    
    const cookieOptions={
        httpOnly:true,
        secure:true
    }
    res.cookie('accessToken',newAccessToken,cookieOptions);           
    res.cookie('refreshToken',newRefreshToken,cookieOptions)
    req.user = returnUser(user);
    next();
  } catch (error) {
    throw new ApiError(403, "Invalid refresh and access token");
  }
}

async function verifyRefreshToken(req,res,next){
  const refreshToken=req.cookie('refreshToken')
}

export {authMiddleware,verifyAccessToken2,verifyRefreshToken2,authMiddleware2};