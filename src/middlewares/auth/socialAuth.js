import {UserModel} from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Remove Response, NextFunction, and CustomRequest as they are TypeScript types



// HandleSocialAuthError
export const HandleSocialAuthError = asyncHandler(async (req, res, next) => {
    const { email, uid, displayName, photoURL, phoneNumber } = req.body;

    try {
        // Check if all required fields are present
        if (!email || !uid || !displayName || !photoURL) {
            return res.status(400).send({
                success: false,
                message: 'Social login data is missing or incomplete!',
                key: 'social_login_data'
            });
        };

        let user;

        if (email) {
            user = await UserModel.findOne({ email: email });
        }
        else if (phoneNumber) {
            user = await UserModel.findOne({ phone: phoneNumber });
        };

        // If user exists, attach user object to the request and skip password check
        if (user) {
            // If user exists and is deleted, return appropriate response
            if (user.isDeleted === true) {
                return res.status(403).json({ success: false, message: 'Your account has been deleted. Please contact support for further assistance.', key: 'user' });
            }
            req.user = user;
            return next();
        } else {
            // If user doesn't exist, proceed to the next middleware/controller
            return next();
        }

    } catch (exc) {
        console.log(exc.message);
        return res.status(500).json({ success: false, message: "Something went wrong. Please try again.", error: exc.message });
    }
});

