import express, { NextFunction, Request, Response } from 'express';
const app = express();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { EXPRESS_CONFIG_LIMIT } from './constants';


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));


app.use(morgan("dev"));
app.use(express.json({ limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: EXPRESS_CONFIG_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());


//routes
import healthcheckRouter from "./routes/healthcheck.routes";
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';

//Admin routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.get('/ping', (req: Request, res: Response) => {
    res.send("Hi!...I am server, Happy to see you boss...");
});

//internal server error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(500).json({
        status: 500,
        message: "Server Error",
        error: err.message
    });
});

//page not found middleware handling
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        sattus: 404,
        message: "Endpoint Not Found"
    });
});


export { app };