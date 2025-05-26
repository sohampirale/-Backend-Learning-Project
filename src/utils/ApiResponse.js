class ApiResponse{
    constructor(
        statusCode,
        message,
        data={},
        success=true,
        stack=null
    ){
        this.statusCode=statusCode;
        this.success=success;
        this.message=message;
        this.data=data,
        this.stack=stack
    }
}

export {ApiResponse}