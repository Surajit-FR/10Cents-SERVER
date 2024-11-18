import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import { ApiError } from "../../utils/ApisErrors";
import { addUser } from "../../utils/auth";
import { IRegisterCredentials } from "../../../types/requests_responseType";
import { sendErrorResponse } from "../../utils/response";
import { generateAccessAndRefreshToken } from "../../utils/createTokens";
import { CustomRequest } from "../../../types/commonType";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { IUser } from "../../../types/schemaTypes";
import { GoogleAuth } from "../../utils/socialAuth"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from "mongoose";


// fetchUserData func.
const fetchUserData = async (userId: string | ObjectId) => {
    const user = await UserModel.aggregate([
        {
            $match: {
                isDeleted: false,
                _id: userId
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0
            }
        }
    ]);
    return user;
};

// Set cookieOption
const cookieOption: { httpOnly: boolean, secure: boolean, maxAge: number, sameSite: 'lax' | 'strict' | 'none' } = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 Day
    sameSite: 'strict'
};

// register user controller
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const userData: IRegisterCredentials = req.body;

    const savedUser = await addUser(userData);

    const newUser = await fetchUserData(savedUser._id)
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(res, savedUser._id);

    return res.status(200)
        .json({
            statusCode: 200,
            data: {
                user: newUser[0],
                accessToken,
                refreshToken
            },
            message: "User Registered Successfully",
            success: true
        });
});

// login user controller
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, isAdminPanel }: IUser & { isAdminPanel?: boolean } = req.body;

    if (!email) {
        return sendErrorResponse(res, new ApiError(400, "Email is required"));
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
        return sendErrorResponse(res, new ApiError(400, "User does not exist"));
    }

    const userId = user._id;

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return sendErrorResponse(res, new ApiError(403, "Invalid user credentials"));
    }

    if (user.isDeleted) {
        return sendErrorResponse(res, new ApiError(403, "Your account is temporarily banned. Please stay with us.", [], userId));
    }

    // Check for admin panel access
    if (isAdminPanel) {
        if (user.userType !== 'SuperAdmin') {
            return sendErrorResponse(res, new ApiError(403, "Access denied. Only SuperAdmins can log in to the admin panel."));
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(res, user._id);
    const loggedInUser = await fetchUserData(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser[0], accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

// logout user controller
export const logoutUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    if (!req.user || !req.user?._id) {
        return sendErrorResponse(res, new ApiError(400, "User not found in request"));
    };

    const userId = req.user?._id;

    await UserModel.findByIdAndUpdate(
        userId,
        {
            $set: { refreshToken: "" }
        },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
    };

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// refreshAccessToken controller
export const refreshAccessToken = asyncHandler(async (req: CustomRequest, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        return sendErrorResponse(res, new ApiError(401, "Unauthorized request"));
    };

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
        const user = await UserModel.findById(decodedToken?._id);

        if (!user) {
            return sendErrorResponse(res, new ApiError(401, "Invalid refresh token"));
        };

        if (user?.refreshToken !== incomingRefreshToken) {
            return sendErrorResponse(res, new ApiError(401, "Refresh token is expired or used"));
        };

        const cookieOption: { httpOnly: boolean, secure: boolean } = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(res, user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, cookieOption)
            .cookie("refreshToken", refreshToken, cookieOption)
            .json
            (
                new ApiResponse
                    (
                        200,
                        { accessToken, refreshToken },
                        "Access token refreshed"
                    )
            );
    } catch (exc: any) {
        return sendErrorResponse(res, new ApiError(401, exc.message || "Invalid refresh token"));
    };
});

// Auth user (Social)
export const authUserSocial = asyncHandler(async (req: CustomRequest, res: Response) => {
    try {
        let user: any = req.user;
        if (!user) {
            const { email, uid, displayName, photoURL, phoneNumber, providerId, userType } = req.body;
            user = await UserModel.findOne({ email: email });

            if (!user) {
                if (providerId === "google.com") {
                    user = await GoogleAuth(email, uid, displayName, photoURL, phoneNumber, userType);
                } else if (providerId === "facebook.com") {
                    return res.status(400).json({ success: false, message: "Facebook login is not supported yet" });
                };

                if (user.err) {
                    return res.status(500).json({ success: false, message: user.message, error: user.err });
                }
            }
        };

        const USER_DATA = { ...user._doc };
        const _data = await fetchUserData(USER_DATA._id);
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(res, user._id);

        // Format the response as per the provided JSON structure
        return res.status(200)
            .cookie("accessToken", accessToken, cookieOption)
            .cookie("refreshToken", refreshToken, cookieOption)
            .json(
                new ApiResponse
                    (
                        200,
                        { user: _data[0], accessToken, refreshToken },
                        "User logged In successfully"
                    )
            );

    } catch (exc: any) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: "Internal server error", error: exc.message });
    }
});