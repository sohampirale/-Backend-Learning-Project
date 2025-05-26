import express from "express"
import cors from "cors";
const app = express();
app.use(cors());      
import fs from "fs"

app.use(express.json({
  type: ["application/json", "text/plain"]
}));
app.post("/from-leetcode-extension", (req, res) => {
  console.log("📥 payload:", req.body);
  res.send("data received successfully");
  console.log('length = '+req.body.code.length);
  fs.writeFileSync("./code.txt",req.body.code);
});



app.listen(3000, () => console.log("🚀 server listening on 3000"));

// import dotenv from "dotenv"
// dotenv.config();
// import express from "express"; 
// import cors from "cors"
// import cookieParser from "cookie-parser" //for being able do perform curd operqations on cookies of user
// let app = express();
// import multer from "multer";

// import connectDB from "./db/connectDB.js";

// //utils
// import { asyncHandler } from "./utils/asyncHandler.js";

// const allowedOrigins=['https://solid-space-fortnight-v6q5gg56jw97cx567-5500.app.github.dev']

// app.use((req,res,next)=>{
//     console.log('new request at backend');
//     next();
// })

// app.use(cors());
// // app.use(cors({
// //     origin:function(origin,callback){
// //         if(!origin){
// //             console.log('request from postman');
// //             return callback(null,true);
// //         }
// //         console.log('origin : '+origin);
// //         if(allowedOrigins.indexOf(origin)!=-1){
// //             callback(null,true);
// //         } else {
// //             callback(new Error("CORS ERROR : This origin is not allowed to any requests to this backend"))
// //         }
// //     },
// //     credentials:true
// // }))

// app.use(express.json({
//     limit:"16kb"
// }));

// app.use(cookieParser());

// app.use(express.urlencoded({
//     extended:true,   //nested obj inside nested obj
//     limit:"16kb"
// }))

// app.use(express.static("public/temp"));

// //routes import
// import {userRouter} from "./routes/user.routes.js";

// // routes declaration
// app.use("/api/v1/users",(req,res,next)=>{
//     console.log('request coming to /api/v1/users');
//     next()
// },userRouter);


// app.post('/from-leetcode-extension',(req,res)=>{
//     res.send("inside /from-leetcode-extension");
//     console.log(JSON.stringify(req.body));
//     res.send("data received successfully")
// })
// asyncHandler(async()=>{
//     await connectDB();
//     app.listen(3000,()=>{
//         console.log('server listening on port 3000');
//     })
// })()

// // tryCatcher2(async()=>{
// //     await connectDB();
// //     app.listen(3000,()=>{
// //         console.log('server listening on port : 3000');
// //     })
// // })();