const express = require("express");
const { VerifyJWTToken } = require("../middlewares/auth/userAuth");
const { rateLimiter } = require("../middlewares/rateLimiter.middleware");
const { getAllUsers, getUser } = require("../controllers/user.controller");

const Router = express.Router;



const router = express.Router();

// Protected routes for users
router.use(VerifyJWTToken);

// get all registered users
router.route('/').get(
    getAllUsers
);
// get loggedin users
router.route('/get-loggedin-user').get(
    getUser
);


module.exports = router;