import { ObjectId } from "mongoose";

interface ICredentials {
    email: string;
    password: string;
};
export interface ILoginCredentials extends ICredentials { };

export interface IRegisterCredentials extends ICredentials {
    firstName: string;
    lastName: string;
    userType: string;
    phone:string;
};

export interface HealthcheckResponse {
    host: Array<string>;
    message: string;
    status: boolean;
    time: Date;
};

export interface HealthcheckApiResponse {
    response: HealthcheckResponse;
};