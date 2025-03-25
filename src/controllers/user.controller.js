const { asyncHandler } = require("../utils/asyncHandler");
const UserModel = require("../models/user.model");
const { sendSuccessResponse } = require("../utils/response");
const { default: mongoose } = require("mongoose");

// Remove Request and Response as they are TypeScript types


// getAllCustomer controller
const getAllCustomer = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc' } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const searchQuery = query
        ? {
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }
        : {};

    const matchCriteria = {
        isDeleted: false,
        userType: "Customer",
        ...searchQuery
    };

    const sortCriteria = {};
    sortCriteria[sortBy] = sortType === 'desc' ? -1 : 1;

    const results = await UserModel.aggregate([
        { $match: matchCriteria },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                isDeleted: 0
            }
        },
        { $sort: sortCriteria },
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber }
    ]);

    const totalRecords = await UserModel.countDocuments(matchCriteria);

    return sendSuccessResponse(res, 200, {
        userData: results,
        pagination: {
            total: totalRecords,
            page: pageNumber,
            limit: limitNumber
        }
    }, "Customer list retrieved successfully.");
});

// get loggedin user
const getUser = asyncHandler(async (req, res) => {

    const { userId } = req.query
    if (!userId) {
        return res.status(400).json({ "success": false, "message": "userId is required" })
    }

    const userDetails = await UserModel.aggregate([
        {
            $match: {
                isDeleted: false,
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                avatar: 1,
                createdAt: 1,
                userType:1,
            }
        }
    ]);

    return sendSuccessResponse(res, 200,
        userDetails[0],
        "User retrieved successfully.");
});

module.exports = {
    getAllCustomer,
    getUser
}