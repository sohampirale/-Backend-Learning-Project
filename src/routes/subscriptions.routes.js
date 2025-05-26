import express from "express"
const subscribeRouter = express.Router();
import multer from "multer";

//controller
import { subscribeChannel,unsubscribeChannel } from "../controllers/subscribe.controllers.js";


//validations
import { subscribeChannelValidation,unsubscribeChannelValidation } from "../validation/subscriber.validations.js";

//middlewares
import {authMiddleware} from "../middlewares/auth.middlewares.js"
import { validate } from "../utils/validate.js";

//routes

subscribeRouter.route('/')
    .post(authMiddleware,validate(subscribeChannelValidation),subscribeChannel)
    .delete(authMiddleware,validate(unsubscribeChannelValidation),unsubscribeChannel)