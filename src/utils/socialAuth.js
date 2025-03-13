const UserModel = require("../models/user.model");
const bcryptjs = require("bcryptjs");

const SecurePassword = async (password) => {
    try {
        // Generate a salt with a cost factor of 10 (you can increase this for more security)
        const salt = await bcryptjs.genSalt(10);
        // Hash the password using the salt
        const hashedPassword = await bcryptjs.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error while hashing the password');
    }
};

// GoogleAuth
 const GoogleAuth = async (email, uid, displayName, photoURL, phoneNumber, userType) => {
    try {
        const HashedPassword = await SecurePassword(uid);
        let trimmed = displayName.trim().split(' ')
        console.log(trimmed)

        const NewUser = new UserModel({
            lastName: trimmed.pop(),
            firstName: trimmed.join(' '),
            avatar: photoURL,
            email: email,
            phone: phoneNumber,
            password: HashedPassword,
            userType: userType
        });
        const userData = await NewUser.save();

        return userData;

    } catch (exc) {
        console.log(exc.message);
        return { message: "Error login with gmail!", err: exc.message };
    };
};

// FacebookAuth
 const FacebookAuth = async (email, uid, displayName, photoURL, phoneNumber, userType) => {
    try {
        const HashedPassword = await SecurePassword(uid);
        let trimmed = displayName.trim().split(' ');
        console.log(trimmed);

        const NewUser = new UserModel({
            lastName: trimmed.pop(),
            firstName: trimmed.join(' '),
            email: email,
            phone: phoneNumber,
            password: HashedPassword,
            userType: userType
        });

        const userData = await NewUser.save();

        return userData;

    } catch (exc) {
        console.log(exc.message);
        return { message: "Error logging in with Facebook!", err: exc.message };
    }
};

module.exports = {
    GoogleAuth,
    FacebookAuth
}