
import express, { Router } from "express";
import {
    refreshAccessToken,
    logoutUser,
    loginUser,
    registerUser,
    authUserSocial,
} from "../controllers/auth/auth.controller";
import { VerifyJWTToken } from "../middlewares/auth/userAuth";
import { HandleSocialAuthError } from '../middlewares/auth/socialAuth';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';


const router: Router = express.Router();

//sign-up
router.route('/signup').post(
    rateLimiter,
    registerUser
);

// Auth user (social)
router.post('/user/social', rateLimiter, [HandleSocialAuthError], authUserSocial);

//login or sign-in route
router.route('/signin').post(
    rateLimiter,
    loginUser
);

/***************************** secured routes *****************************/
// Logout
router.route('/logout').post(
    rateLimiter,
    [VerifyJWTToken],
    logoutUser
);
router.route('/add-associate').post(
    rateLimiter,
    [VerifyJWTToken],
);

// Refresh token routes
router.route('/refresh-token').post(
    rateLimiter,
    refreshAccessToken
);


export default router;