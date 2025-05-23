const asyncHandler= (func)=>async(req,res,next)=>{
    console.log('inside asyncHandler');
    Promise.resolve(func(req,res,next)).catch((err)=>{
        console.log('ERROR : '+err);
        next(err);
    })
}

export {asyncHandler}