import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const ObjectId=Schema.Types.ObjectId;

const videoSchema =new Schema({
    videoFile:{
        type:String,
        required:true,
        unique:true
    },
    thumbnail:{
        type:String
    },
    owner:{
        type:ObjectId,
        ref:"User",
        required:true   
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        default:"No description"
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished :{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})

const Video = mongoose.model("Video",videoSchema);

Video.plugin(mongooseAggregatePaginate);

export default Video;