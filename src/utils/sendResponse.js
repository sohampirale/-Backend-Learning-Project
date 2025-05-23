function sendResponse(res,{
    statusCode=200,
    message="Success",
    errors:[],
    success=true,
    stack=null,
    data=null
}){
    res.status(statusCode).json({
        message,
        success,
        errors,
        stack,
        data
    })
}

function sendResponse(res,obj){
    res.status(statusCode).json({
        message:obj.message,
        success:obj.success,
        errors:obj.errors,
        stack:obj.stack,
        data:obj.data
    })
}

export default {sendResponse}