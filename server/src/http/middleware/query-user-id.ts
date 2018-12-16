import {BaseResponseModel} from "../base-response.model";
import {BaseRequestModel} from "../base-request.model";
import {BaseRequestHandler} from "../base-request.handler";

export function queryUserIdMiddleware(request: BaseRequestModel<{}>, response: BaseResponseModel<{}>, next: Function) {
    if(!request.query.userId) {
        console.log('Invalid request: No user id provided');
        BaseRequestHandler.error(response, 'No user id provided');
    }
    next();
}