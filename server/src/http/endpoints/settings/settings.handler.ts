import {BaseRequestHandler} from "../../base-request.handler";
import {SettingsRequestModel} from "./settings.model";
import {BaseResponseModel} from "../../base-response.model";
import {UserModel} from "../../../database/user/user.model";

export class SettingsHandler extends BaseRequestHandler {
    public async handle(request: SettingsRequestModel, response: BaseResponseModel<{}>) {
        const user: UserModel = await this.context.database.user.getUser(request.query.userId);
        if(user) {
            await this.context.database.user.updateUser({...user, ...request.body});
        } else {
            await this.context.database.user.addUser({userId: request.query.userId, ...request.body});
        }
        BaseRequestHandler.success(response);
    }
}