class ApiResponse{
    constructor(
        statusCode,
        message,
        errors,
        data,
        stack
    ){
        this.statusCode=statusCode;
        this.message=message;
        this.errors=errors;
        this.data=data,
        this.stack=stack
    }
}