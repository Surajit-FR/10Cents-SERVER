import { Document, ObjectId } from "mongoose";

export interface IUser extends Document {
    _id: string | ObjectId;
    fullName: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    dob: Date;
    oldPassword: string;
    password: string;
    avatar: string;
    coverImage: string;
    isVerified: boolean;
    userType: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};