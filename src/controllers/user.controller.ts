import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import UserModel from "../models/user.model";
import { sendSuccessResponse } from "../utils/response";

// getAllUsers controller
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

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

    const sortCriteria: any = {};
    sortCriteria[sortBy as string] = sortType === 'desc' ? -1 : 1;

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