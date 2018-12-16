import {Context} from "../context.model";
import {BaseResponseModel} from "./base-response.model";

export class BaseRequestHandler {
    constructor(protected context: Context) {
    }

    public static success(response: BaseResponseModel<any>, data?: any): void {
        response.json({
            success: true,
            data: data
        });
    }

    public static error(response: BaseResponseModel<any>, message: string): void {
        response.json({
            success: false,
            error: message
        });
    }
}
