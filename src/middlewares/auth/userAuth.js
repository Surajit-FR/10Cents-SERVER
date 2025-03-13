const { ApiError } = require("../../utils/ApisErrors");
const { sendErrorResponse } = require("../../utils/response");
const { asyncHandler } = require("../../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/user.model");

// Remove Response, NextFunction, JwtPayload, and CustomRequest as they are TypeScript types


// VerifyToken
const VerifyJWTToken = asyncHandler(async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log("Token is missing or empty");
            return sendErrorResponse(res, new ApiError(401, "Unauthorized Request"));
        };

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await UserModel.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return sendErrorResponse(res, new ApiError(401, "Invalid access token"));
        };
        req.user = user;

        next();
    } catch (error) {
        return sendErrorResponse(res, new ApiError(401, error.message || "Invalid access token"));
    }
});

// verifyUserType
const verifyUserType = (requiredUserTypes = null) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            return sendErrorResponse(res, new ApiError(401, "Unauthorized Request"));
        }

        if (requiredUserTypes && !requiredUserTypes.includes(req.user.userType)) {
            return sendErrorResponse(res, new ApiError(403, `Access denied. Requires one of the following roles: ${requiredUserTypes.join(", ")}.`));
        }

        next();
    });
};

module.exports = {
    VerifyJWTToken,
    verifyUserType
}