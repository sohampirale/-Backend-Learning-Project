
// const avatarUpload = multer({
//     dest:'public/avatars'
// })

// const thumbnailUpload = multer({
//     dest:"public/thumbnails"
// })

// const upload = multer({
//     dest:"public/multiple_photos"
// })

// const uploadWithOptionsConfig=multer.diskStorage({
//     destination:function(req,file,cb){
//         console.log('inside destination function');
//         console.log("file = "+JSON.stringify(file));
//         cb(null,"public/diskStorage");
//     },
//     filename:function(req,file,cb){
//         console.log('inside filename function');
//         cb(null,file.originalname);
//     }
// })

// const uploadWithOptions = multer({
//     storage:uploadWithOptionsConfig,
//     limits:{
//         fileSize: 100* 1024,
//         files:5
//     }
// })

// const multiFieldNameUpload = multer({
//     dest:"public/multiFieldNameUpload"
// })

// connectDB()
//     .then(()=>{
//         app.listen(3000,()=>{
//                 console.log('server listening on port : 3000');
//         })
//     })
//     .catch((err)=>{
//         console.log('Failed to connect with DB, ERR : '+err);
// })

// app.post("/upload-avatar",avatarUpload.single('avatar'), (req,res)=>{
//     console.log('inside /upload-avatar');
//     console.log('req.file = '+JSON.stringify(req.file));
//     res.status(203).json({
//         message:"File uploaded successfully"
//     })
// })

// app.post("/upload-avatar",uploadWithOptions.single('avatar'), (req,res)=>{
//     console.log('inside /upload-avatar');
//     console.log('req.file = '+JSON.stringify(req.file));
//     res.status(203).json({
//         message:"File uploaded successfully"
//     })
// })

// app.post("/upload-photos",upload.array("gallery",5),(req,res)=>{

//     console.log('inside /upload-photos');
//     console.log('photos : '+JSON.stringify(req.files));

//     res.json({
//         message:"Multiple photos uploaded successfully"
//     })
// })

// app.post("/upload-multi-field-files",
//     multiFieldNameUpload.fields([
//         {name:'avatar',maxCount:1},
//         {name:'gallery',maxCount:5}
//     ]),
//     (req,res)=>{
//         console.log('inside /upload-multi-field-files');
//         console.log('req.files = '+JSON.stringify(req.files));
//         res.json({
//             message:"multi field names uploaded successfully"
//         })
//     }
// )
