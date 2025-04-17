import  express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import  morgan from 'morgan';
import  {EXPRESS_CONFIG_LIMIT} from './constants.js';
//routes
import  healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();



app.use(cors({
    origin: [process.env.CORS_ORIGIN,"http://13.203.196.198","http://3.110.107.103"],
    credentials: true,
}));


app.use(morgan("dev"));
app.use(express.json({ limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());





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


export default app