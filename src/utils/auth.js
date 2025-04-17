import {UserModel} from "../models/user.model.js";
import { ApiError } from "./ApisErrors.js";


export const addUser = async (userData) => {
    const { firstName, lastName, email, password, userType, phone } = userData;

    // Check for duplicate user
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        throw new Error("User with email already exists");    }

    // Create the new user
    const newUser = new UserModel({
        firstName,
        lastName,
        email,
        password,
        userType,
        phone,
    });

    const savedUser = await newUser.save();

    return savedUser;
};
