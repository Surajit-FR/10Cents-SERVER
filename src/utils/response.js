const { ApiResponse } = require("./ApiResponse");

const sendSuccessResponse = (res, statusCode, data, message = "Success") => {
    const response = new ApiResponse(statusCode, data, message);
    return res.status(response.statusCode).json(response);
};

const sendErrorResponse = (res, error) => {
    const responsePayload = {
        statusCode: error.statusCode,
        success: error.success,
        message: error.message,
        errors: error.errors
    };

    // Conditionally add the data field if it exists and is not null/undefined
    if (error.data) {
        responsePayload.data = error.data;
    }

    return res.status(error.statusCode).json(responsePayload);
};

module.exports = { sendSuccessResponse, sendErrorResponse };
