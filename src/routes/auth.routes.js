
const express = require("express");
const {
    refreshAccessToken,
    logoutUser,
    loginUser,
    registerUser,
    authUserSocial,
} = require("../controllers/auth/auth.controller");

const { VerifyJWTToken } = require("../middlewares/auth/userAuth");
const { HandleSocialAuthError } = require("../middlewares/auth/socialAuth");
const { rateLimiter } = require("../middlewares/rateLimiter.middleware");

const Router = express.Router; // Extract Router from express



const router = express.Router();

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


module.exports =  router;