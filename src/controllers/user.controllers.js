import {asyncHandler} from "../utils/asyncHandler.js"
import {z} from "zod";
import {uplodFileOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.models.js"
import { email, refine } from "zod/v4";
import {ApiError} from '../utils/ApiError.js'

const userSignup= asyncHandler(
    async(req,res,next)=>{
        console.log('inside userSignup');
        console.log('req.body = '+JSON.stringify(req.body));
        console.log('req.file = '+JSON.stringify(req.file));

        const reqBody = z.object({
            username:z.string().min(3).max(100),
            email:z.string().email().min(5).max(100),
            fullname:z.string().min(4).max(100),
            password:z.string()
        })

        const  parsedBody = reqBody.safeParse(req.body);
        
        if(!parsedBody.success){
            return res.status(401).json({
                message:"Insufficient/Incorrect data provided",
                error:parsedBody.error
            })
        }

        const {username,fullname,password,email} = parsedBody.data;
        const avatarLocalPath=req.file?.path;
               
        if(!avatarLocalPath){
            return res.status(401).json({
                message:"Failed to get path of the avatar file"
            })
        }
        
        const response =await uplodFileOnCloudinary(avatarLocalPath);
        const user=await User.create({
            username,
            email,
            fullName:fullname,
            password,
            avatar:response.url
        })
        
        res.status(200).json({
            message:"Signup successfull"
        }) 
    }
)

const loginUser = async(req,res)=>{
    const reqBody=z.object({
        username:z.string().max(25).optional(),
        email:z.string().email().max(100).optional(),
        password:z.string().min(8).max(100)
            .refine(val=>/[a-z]/.test(val))
            .refine(val=>/[A-Z]/.test(val))
            .refine(val=>/[0-9]/.test(val))
            .refine(cal=>/[\W_]/.test(val))
    });
    const parsedBody= reqBody.safeParse(req.body);
    if(!parsedBody.success){
        return new ApiError(403,'Insufficient/Incorrect data provided',parsedBody.error)
    }
    //get username/email && password
    //check if the user already exists with that username/password
    //fetch the user
    //if user has unsuccessattempts >5
    //  1.If the Date.now - unsucessfult attempts time >5
    //      i.Initialize the unsuccessfull attempts = 0
    //      ii.Let the user try again to login
    //  2.If date.now - unsuccessattempts startTime <5
    //      i.Do not allow user to login
    //compare the password
    //on correct pw
    //  1.generate token and access token
    //  2.store refresh token in db
    //  3.If unsuccessfull attempts are there initialize them to 0 and remove the unssuccess attempts time to null
    //  3.send back access token and refresht token to frontend
    //on incorrect pw
    //  1.Increase no of unsuccessfull attempts of that user
    //  2.If unsuccessfull attempts are 0
    //      i.set unsuccessful attempt start time = Date.now
    //      ii.Increase the unsuccessfull attempts to 1
    //      iii.Return response
    //  3.If unsuccessfull attempts are > 5
    //      i.increase unsuccessfull Attempts of that user
    //      ii.Return response
    const {username,email,password} =  req.body;
    const query=username?{username}:email?{email}:null;
    if(query){
        return ApiError(403,'Username or Email is required to login');
    }
    const user = await User.findOne(query)
        .collation({ locale: 'en', strength: 2 })
    if(!user){
        return new ApiError(404,`User with that ${query.email?'email':'username'} does not exist`);
    }

    if(user.unsuccessfulAttempts>5){
        if(user.unsuccessfulAttemptsStartTime-Date.now()>)  
    }

    if(user.comparePassword(password)){

    }


}

const checkDuplicate=async(value,checkType)=>{
    const isEmail = checkType?checkType==='email':null;
    const query=isEmail?{email:value}:{username:value};
    const user=await User.findOne(query)
        .collation({ locale: 'en', strength: 2 })
        .exec();;
    if(user){
        res.json({
            exists:true,
            message:`User with that ${isEmail?'email':'username'} already exists`
        })
    } else {
         res.json({
            exists:true,
            message:`User with that ${isEmail?'email':'username'} does not exist`
        })
    }
}

export {userSignup}