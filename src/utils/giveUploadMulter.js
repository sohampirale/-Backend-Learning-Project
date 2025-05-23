import multer from "multer";

function giveUploadMulter(storage){
    console.log('inside giveUploadMulter()');
    const upload=multer({
        storage
    })
    return upload;
}

export {giveUploadMulter};