import {BaseRequestHandler} from "../../base-request.handler";
import {BaseRequestModel} from "../../base-request.model";
import {SettingsResponseModel} from "./saved-expeditions.model";

export class SavedExpeditionsHandler extends BaseRequestHandler {

    public async handle(request: BaseRequestModel<{}>, response: SettingsResponseModel) {
        const IDs = await this.context.database.expedition.getUserSavedExpeditionIds(request.query.userId);
        BaseRequestHandler.success(response, IDs);
    }
}