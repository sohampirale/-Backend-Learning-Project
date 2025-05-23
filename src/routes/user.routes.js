import{Router} from "express"
import multer from "multer";
const userRouter = Router();

import { userSignup } from "../controllers/user.controllers.js";

// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//         console.log('inside destination function')
//         cb(null,'public/temp/user/register');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     }
// })

// const upload = multer({
//     storage
// })

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



userRouter.get("/test",(req,res)=>{
    console.log('inside test');
    
    res.json({
        message:"hello from api/v1/users/test"
    })
})
export  {userRouter}