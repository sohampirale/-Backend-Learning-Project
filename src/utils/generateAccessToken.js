import jwt from "jsonwebtoken";

function generateAccessToken(payload){
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    });
}

export {generateAccessToken}