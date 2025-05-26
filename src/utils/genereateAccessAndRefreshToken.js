import { generateAccessToken } from "./generateAccessToken";
import { generateRefreshToken } from "./generateRefreshToken";

function generateAccessAndRefreshToken(payload){
    return {
        accessToken:generateAccessToken(payload),
        refreshToken:generateRefreshToken(payload)
    }
}

export {generateAccessAndRefreshToken};