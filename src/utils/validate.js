import { ApiError } from "./ApiError";

const validate=(schema,location='body')=>{
    return async(req,res,next)=>{

        const parsed=schema.safeParse(req[location]);
        if(!parsed.success){
            return next(new ApiError(400,'Insufficient/Incorrect data received'));
        }
        req[location]=parsed.data;
        next();
    }
}

export {validate};