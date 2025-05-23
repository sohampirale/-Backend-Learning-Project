import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

const uplodFileOnCloudinary = async function(fileUploadPath){
    console.log('fileUploadPath = '+fileUploadPath);
    
    try{
        const response = await cloudinary.uploader.upload(fileUploadPath);
        console.log('file uploaded successfully : '+response.url);
        console.log('response = '+JSON.stringify(response));
        
        fs.unlink(fileUploadPath,(err)=>{
            if(err){
                console.log('Error deleting files from server');
            } else {
                console.log('Files deleted successfully from server');
            }
        })
        return response;
    } catch(err){
        console.log('failed to upload the video');
        console.log('ERROR : '+err);
        fs.unlink(fileUploadPath);
        return null;
    }
}

export {uplodFileOnCloudinary}