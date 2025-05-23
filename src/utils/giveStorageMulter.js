import multer from "multer";
function giveStorageMulter(givenDestination){
    console.log('inside giveStorageMulter()');
    
    const storage = multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,givenDestination);
        },
        filename:function(req,file,cb){
            cb(null,file.originalname);
        }
    })
    return storage
}

export {giveStorageMulter}

