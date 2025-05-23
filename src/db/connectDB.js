import mongoose from "mongoose";

async function connectDB(){
    await mongoose.connect(process.env.MONGODB_URI+'/learningMongo');
    console.log('DB connected successfully');
}

export default connectDB;