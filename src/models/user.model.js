// const mongoose = require("mongoose");
// const { Schema, Model } = mongoose;
// const bcryptjs = require("bcryptjs");
// const jwt = require("jsonwebtoken");
import mongoose from "mongoose";
import { Schema,Model } from "mongoose";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
// Remove IUser import since it's a TypeScript type



const UserSchema = new Schema({
    fullName: {
        type: String,
        required: false,
        trim: true,
        index: true,
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        index: true,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        index: true,
    },
    username: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: [true, "Email Address is required"],
        unique: true,
        lowercase: true,
    },
    dob: {
        type: Date
    },
    phone: {
        type: String,
        default: "",
        required: false
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    oldPassword: {
        type: String,
        // required: [true, "Password is required"],
    },
    avatar: {
        type: String,
        default: "",
        required: false,
    },
    coverImage: {
        type: String,
    },
    longitude: {
        type: String,
        default: null
    },
    latitude: {
        type: String,
        default: null
    },
    IPAddress: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ["SuperAdmin", "Customer"],
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

//pre - save hook for hashing password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcryptjs.hash(this.password, 10);
        next();
    } catch (err) {
        next(err)
    }
});

//check password
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password)
}

//generate acces token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
};


export const UserModel = mongoose.model("user", UserSchema);

