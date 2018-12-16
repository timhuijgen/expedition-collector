import {Response} from "express";

interface BaseResponse<T> {
    success: boolean; /* Indicate the success of the request */
    data?: T;         /* Any data that needs to be send to the client on success */
    error?: string;   /* Error message on failure */
}

export interface BaseResponseModel<T> extends Response {
    json: (responseObject: BaseResponse<T>) => Response;
}