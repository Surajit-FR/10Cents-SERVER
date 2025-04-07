const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const EXPRESS_CONFIG_LIMIT = require('./constants');




app.use(cors({
    origin: [process.env.CORS_ORIGIN,"http://13.203.196.198","http://3.110.107.103"],
    credentials: true,
}));


app.use(morgan("dev"));
app.use(express.json({ limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());


//routes
const healthcheckRouter = require("./routes/healthcheck.routes");
const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");


//Admin routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.get('/ping', (req, res) => {
    res.send("Hi!...I am server, Happy to see you boss...");
});

//internal server error handling
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        status: 500,
        message: "Server Error",
        error: err.message
    });
});

//page not found middleware handling
app.use((req, res, next) => {
    res.status(404).json({
        sattus: 404,
        message: "Endpoint Not Found"
    });
});


module.exports =  { app };