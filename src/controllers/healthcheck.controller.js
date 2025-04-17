import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import os from 'os';
import { ApiError } from "../utils/ApisErrors.js";


// healthcheck controller
export const healthcheck = asyncHandler(async (req, res) => {
    try {
        const networkInterfaces = os.networkInterfaces();

        // Extract IPv4 addresses
        const IPv4Addresses = Object.values(networkInterfaces)
            .flat()
            .filter((interfaceInfo) =>
                interfaceInfo !== undefined && interfaceInfo.family === 'IPv4')
            .map(interfaceInfo => interfaceInfo.address);

        if (mongoose.connection.name) {
            const message = {
                host: IPv4Addresses,
                message: 'Healthy',
                status: true,
                time: new Date(),
            };
            return res.status(200).json({ response: message });
        } else {
            const message = {
                host: IPv4Addresses,
                message: 'Unhealthy',
                status: false,
                time: new Date(),
            };
            return res.status(501).json({ response: message });
        }
    } catch (error) {
        throw new ApiError(500, (error).message);
    }
});

