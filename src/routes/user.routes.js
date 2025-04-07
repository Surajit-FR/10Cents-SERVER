const express = require("express");
const { VerifyJWTToken } = require("../middlewares/auth/userAuth");
const { rateLimiter } = require("../middlewares/rateLimiter.middleware");
const { getAllCustomer, getUser } = require("../controllers/user.controller");
const { addIPDetails } = require("../controllers/auth/auth.controller")


const Router = express.Router;



const router = express.Router();

// Protected routes for users
// router.use(VerifyJWTToken);

// get all registered users
router.route('/get-all-customer').get(
    getAllCustomer
);
// get loggedin users
router.route('/get-single-user').get(
    getUser
);
router.route('/add-ip-details').post(
    addIPDetails
);


module.exports = router;