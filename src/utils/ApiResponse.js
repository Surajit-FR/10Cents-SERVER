class ApiResponse {
    statusCode;
    data;
    message;
    success;
    token; // Optional property

    constructor(statusCode, data, message = "Success", token) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.token = token;
    }
}

module.exports = { ApiResponse };