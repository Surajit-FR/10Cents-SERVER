const UserModel = require("../../models/user.model");
const { ApiError } = require("../../utils/ApisErrors");
const { addUser } = require("../../utils/auth");
const { sendErrorResponse } = require("../../utils/response");
const { generateAccessAndRefreshToken } = require("../../utils/createTokens");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { GoogleAuth } = require("../../utils/socialAuth");
const jwt = require("jsonwebtoken");



// fetchUserData func.
const fetchUserData = async (userId) => {
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
const cookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 Day
    sameSite: 'strict'
};


// register user controller
const registerUser = asyncHandler(async (req, res) => {
    const userData = req.body;

    const savedUser = await addUser(userData);

    const newUser = await fetchUserData(savedUser._id)
    // const { accessToken, refreshToken } = await generateAccessAndRefreshToken(savedUser._id);

    return res.status(200)
        .json({
            statusCode: 200,
            data: {
                _id: newUser[0]._id,
            },
            message: "User Registered Successfully",
            success: true
        });
});

// login user controller
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, isAdminPanel } = req.body;

    if (!email) {
        return res.status(400).json({ "errors": "Email is required" })
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ "errors": "User does not exist" })
    }

    const userId = user._id;

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(403).json({ "errors": "Invalid user credentials" });
    }

    if (user.isDeleted) {
        return res.status(403).json({ "errors": "Your account is temporarily banned. Please stay with us.", userId });
    }

    // Check for admin panel access
    if (isAdminPanel) {
        if (user.userType !== 'SuperAdmin') {
            return res.status(403).json({ "errors": "Access denied. Only SuperAdmins can log in to the admin panel." });
        }
    }

    // const { accessToken, refreshToken } = await generateAccessAndRefreshToken( user._id);
    const loggedInUser = await fetchUserData(user._id);
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                { _id: loggedInUser[0]._id },
                "User logged in successfully"
            )
        );
});

// logout user controller
const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user || !req.user?._id) {
        return res.status(400).json({
            message: "User not found in request"
        });
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
        sameSite: 'strict',
    };

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// refreshAccessToken controller
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {

        return sendErrorResponse(res, new ApiError(401, "Unauthorized request"));
    };

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await UserModel.findById(decodedToken?._id);

        if (!user) {
            return sendErrorResponse(res, new ApiError(401, "Invalid refresh token"));
        };

        if (user?.refreshToken !== incomingRefreshToken) {
            return sendErrorResponse(res, new ApiError(401, "Refresh token is expired or used"));
        };

        const cookieOption = {
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
    } catch (exc) {
        return sendErrorResponse(res, new ApiError(401, exc.message || "Invalid refresh token"));
    };
});

// Auth user (Social)
const authUserSocial = asyncHandler(async (req, res) => {
    try {
        let user = req.user;
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

    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: "Internal server error", error: exc.message });
    }
});


const addIPDetails = asyncHandler(async (req, res) => {
    const { userId, latitude, longitude, IPAddress } = req.body;

    if (!userId) {
        return res.status(400).json({ "errors": "User ID is required" })
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
            $set: { latitude, longitude, IPAddress }
        },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json({ "errors": "User not found" })
    }

    return res.status(200).json({
        statusCode: 200,
        data: updatedUser,
        message: "IP details updated successfully",
        success: true
    });
})

module.exports = {
    fetchUserData,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    authUserSocial,
    addIPDetails
}