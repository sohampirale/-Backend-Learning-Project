function tryCatcher2(func){
    return function(){
        try{
            func();
        }catch(err){
            console.log('Error : '+err);
        }
    }
}

function asyncHandler(fn){
    return async function(req,res,next){
        try{
            fn(req,res,next);
        }catch(err){
            console.log('ERR : '+err);
            res.status(err.status||500).json({
                msg:err.message
            })
        }
    }
}

const asyncHanlder2= (fn)=>async()=>{
    try {
        await fn(req,res,next);
    } catch (error) {
        console.log('ERROR : '+error.message);
    }
}

export {asyncHandler,tryCatcher2}