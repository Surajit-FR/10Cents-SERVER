import express from "express";
import { VerifyJWTToken } from "../middlewares/auth/userAuth.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { getAllCustomer, getUser } from "../controllers/user.controller.js";
import { addIPDetails } from "../controllers/auth/auth.controller.js"


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

export default router