import express from "express"
import multer from "multer";
const videoRouter=express.Router();

//middlewares
import{authMiddleware} from "../middlewares/auth.middlewares.js"
import { videoOwnershipMiddleware } from "../middlewares/video.middlewares.js";

//controllers
import {
    uploadVideo,
    deleteVideo,
    updateVideoDetails,
    getVideoDetails,
    unpublishVideo,
    publishVideo
} from "../controllers/video.controllers.js"

//validations
import  {
    uploadVideoValidation,
    updateVideoDetailsValidation,
    videoIdValidation
} from "../validation/video.validations.js"

//utils
import {validate} from "../utils/validate.js"


const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"public/temp/video");
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    }
})

const upload = multer({
    storage
})

//routes

videoRouter.route("/")
    .post(authMiddleware,upload.fields([
        {name:"videoFile"},{name:"thumbnail"}
    ]),validate(uploadVideoValidation),videoOwnershipMiddleware,uploadVideo)

videoRouter.route('/:id')
    .get(authMiddleware,validate(videoIdValidation,"params"),getVideoDetails)
    .put(authMiddleware,upload.single('thumbnail'),validate(updateVideoDetailsValidation),videoOwnershipMiddleware,updateVideoDetails)
    .delete(authMiddleware,validate(videoIdValidation,"params"),videoOwnershipMiddleware,deleteVideo)

videoRouter.route("/:id/publish")
    .post(authMiddleware,validate(videoIdValidation,"params"),videoOwnershipMiddleware,publishVideo)

videoRouter.route('/:id/unpublish')
    .post(authMiddleware,validate(videoIdValidation,"params"),videoOwnershipMiddleware,unpublishVideo);

