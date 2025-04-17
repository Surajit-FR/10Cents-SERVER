const { ApiError } = "./ApisErrors";
import {UserModel} from '../models/user.model.js';

export const generateAccessAndRefreshToken = async ( userId) => {
    try {
        const user = await UserModel.findById(userId);
        const accessToken = user?.generateAccessToken();
        const refreshToken = user?.generateRefreshToken();

        if (!user) {
            throw new Error("User Not Found");        }
        user.refreshToken = refreshToken;
        await user?.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };


    } catch (errors) {
        console.log("err",errors);
        
        throw new Error("Something went wrong while generating tokens");
    };
};
