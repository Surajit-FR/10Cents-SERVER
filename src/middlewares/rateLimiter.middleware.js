const rateLimit = require("express-rate-limit");


// Rate limiter middleware function
 const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 20,
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    rateLimiter
}