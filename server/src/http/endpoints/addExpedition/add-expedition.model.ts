import {BaseRequestModel} from "../../base-request.model";

export interface ClientExpeditionReport {
    messageId: number,
    date: string,
    content: string,
    location: string
}

export type AddExpeditionRequest = BaseRequestModel<ClientExpeditionReport>;