import jwt from "jsonwebtoken";

function generateRefreshToken(payload){
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    });
}

export {generateRefreshToken}