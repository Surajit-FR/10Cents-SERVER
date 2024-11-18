
import express, { Router } from "express";
import { VerifyJWTToken } from "../middlewares/auth/userAuth";
import { rateLimiter } from '../middlewares/rateLimiter.middleware';
import { getAllUsers } from "../controllers/user.controller";


const router: Router = express.Router();

// Protected routes for users
router.use(VerifyJWTToken);

// get all registered users
router.route('/').get(
    getAllUsers
);


export default router;