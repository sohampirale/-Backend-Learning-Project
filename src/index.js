import dotenv from "dotenv"
import express from "express"; 
import cors from "cors"
import cookieParser from "cookie-parser" //for being able do perform curd operqations on cookies of user
let app = express();
import multer from "multer";

import connectDB from "./db/connectDB.js";

//utils
import { asyncHandler } from "./utils/asyncHandler.js";

const allowedOrigins=['https://solid-space-fortnight-v6q5gg56jw97cx567-5500.app.github.dev']

app.use((req,res,next)=>{
    console.log('new request at backend');
    next();
})

app.use(cors({
    origin:function(origin,callback){
        if(!origin){
            console.log('request from postman');
            return callback(null,true);
        }
        console.log('origin : '+origin);
        if(allowedOrigins.indexOf(origin)!=-1){
            callback(null,true);
        } else {
            callback(new Error("CORS ERROR : This origin is not allowed to any requests to this backend"))
        }
    },
    credentials:true
}))

app.use(express.json({
    limit:"16kb"
}));

app.use(cookieParser());

app.use(express.urlencoded({
    extended:true,   //nested obj inside nested obj
    limit:"16kb"
}))

app.use(express.static("public/temp"));

//routes import
import {userRouter} from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users",(req,res,next)=>{
    console.log('request coming to /api/v1/users');
    next()
},userRouter);


app.get('/test',(req,res)=>{
    res.send("hello from /test");
})
asyncHandler(async()=>{
    await connectDB();
    app.listen(3000,()=>{
        console.log('server listening on port 3000');
    })
})()

// tryCatcher2(async()=>{
//     await connectDB();
//     app.listen(3000,()=>{
//         console.log('server listening on port : 3000');
//     })
// })();