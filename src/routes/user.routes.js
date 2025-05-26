import{Router} from "express"
import multer from "multer";
const userRouter = Router();

import { userSignup,loginUser,checkDuplicate,logoutUser,refreshAccessToken,changePassword,getCurrentUser,updateUserDetails,updateUserAvatar,getUserChannelProfile,getUserWatchHistory } from "../controllers/user.controllers.js";
import { authMiddleware,verifyAccessToken2,verifyRefreshToken2} from "../middlewares/auth.middlewares.js";

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"public/temp/user/register");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
})

const upload=multer({
    storage
})

userRouter.post("/signup",upload.single('avatar'),(req,res,next)=>{
    console.log('req.files = '+JSON.stringify(req.files));
    console.log('req.body = '+JSON.stringify(req.body));
    next()
},userSignup);

userRouter.post("/login",loginUser)

userRouter.get("/refreshAccessToken",refreshAccessToken);

//secured routes

userRouter.post("/logout",authMiddleware,logoutUser)

userRouter.route("/get-current").get(authMiddleware,getCurrentUser);

userRouter.route("/change-password").post(authMiddleware,changePassword);

userRouter.route("/updateUserDetails").patch(authMiddleware,updateUserDetails);

userRouter.route("/update-avatar").patch(authMiddleware,upload.single('avatar'),updateUserAvatar);

userRouter.route('/channel-info').get(authMiddleware,getUserChannelProfile)

userRouter.route("/getUserWatchHistory").get(authMiddleware,getUserWatchHistory);

export  {userRouter}