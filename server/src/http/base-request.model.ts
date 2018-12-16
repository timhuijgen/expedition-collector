import {Request} from "express";

export interface BaseRequestModel<T> extends Request {
    query: {
        userId: string;
    }
    body: T
}