const asyncHandler= (func)=>async(req,res,next)=>{
    console.log('inside asyncHandler');
    try {
        await func(req,res,next);
    } catch (error) {
        console.log('inside asycnHandler -> ERROR : '+err);
        next(err);
    }
}

export {asyncHandler}