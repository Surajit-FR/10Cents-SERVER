const { asyncHandler } = require("../utils/asyncHandler");
const UserModel = require("../models/user.model");
const { sendSuccessResponse } = require("../utils/response");

// Remove Request and Response as they are TypeScript types


// getAllUsers controller
const getAllUsers = asyncHandler(async (req, res) => {
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

    const userDetails = await UserModel.aggregate([
        {
            $match: {
                isDeleted: false,
                _id: userId
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
            }
        }
    ]);

    return sendSuccessResponse(res, 200,
        userDetails[0],
        "Loggedin user retrieved successfully.");
});

module.exports = {
    getAllUsers,
    getUser
}