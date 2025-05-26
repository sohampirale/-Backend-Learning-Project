import { generateAccessToken } from "./generateAccessToken.js";
import { generateRefreshToken } from "./generateRefreshToken.js";

function generateAccessAndRefreshToken(payload){
    return {
        accessToken:generateAccessToken(payload),
        refreshToken:generateRefreshToken(payload)
    }
}

export {generateAccessAndRefreshToken};