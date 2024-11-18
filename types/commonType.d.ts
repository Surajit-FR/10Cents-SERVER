import { Request, Response, NextFunction } from "express";
import { IUser } from "./schemaTypes";

export type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promises<any>;
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promises<any>;

export interface CustomRequest extends Request {
    user?: IUser;
};

// Example DBInfo type
export type DBInfo = {
    STATUS: string;
    HOST: string;
    DATE_TIME: string;
};