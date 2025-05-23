import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import { toLowerCase } from "zod/v4";

const ObjectId = Schema.Types.ObjectId;

const userSchema= new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        tolowercase:true
    },
    email:{
        type:String,
        required:true,
        unique:[true],
        tolowercase:true
    },
    fullName:{
        type:String,
        required:true
    },
    avatar:{
        type:String //cloudinary
    },
    coverImage:{
        type:String //cloudinary
    },
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String
    },
    watchHistory:[
        {
            type:ObjectId,
            ref:"Video"
        }
    ]
},{
    timestamps:true
})

userSchema.pre("save",async function(next){
    if(this.isModified("pasword")){
        this.password=await bcrypt.hash(this.password,5);
    }
    next();
})

userSchema.methods.testingMethod=function(){
    console.log('this._id = '+this._id);
    console.log('this.id = '+this.id);
}

userSchema.methods.comparePassword= async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(id){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })   
}


userSchema.methods.generateRefreshToken= function(){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}

const User = mongoose.model("User",userSchema);

export {User};