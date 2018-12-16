import {BaseRequestHandler} from "../../base-request.handler";
import {AddExpeditionRequest} from "./add-expedition.model";
import {ExpeditionModel} from "../../../database/expedition/expedition.model";
import {expeditionFactory} from "../../../expedition.factory";
import {BaseResponseModel} from "../../base-response.model";

export class AddExpeditionHandler extends BaseRequestHandler {

    public async handle(request: AddExpeditionRequest, response: BaseResponseModel<{}>) {
        const expedition: ExpeditionModel = expeditionFactory(request.query.userId, request.body);
        await this.context.database.expedition.addExpedition(expedition);
        BaseRequestHandler.success(response);
    }
}