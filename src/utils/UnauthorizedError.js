class UnauthorizedError extends Error{
    constructor(
        statusCode=500,
        message="Something went wrong",
        errors=[],
        stack
    ){
         this.statusCode=statusCode
         this.message=message
         this.errors=errors
        if(stack){
            this.stack=stack
        } else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}