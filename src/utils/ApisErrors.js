export class ApiError extends Error {
    statusCode;
    data;
    success;
    errors;

    constructor(
        statusCode,
        message = "Something Went Wrong",
        errors = [],
        data = null,
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}



