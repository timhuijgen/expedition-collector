import {BaseRequestModel} from "../../base-request.model";
import {ResourceType} from "../../../matchers/resource-type.matcher";

export interface ClientSettings {
    trading: string;
    fleetValue?: {
        [ResourceType.Metal]?: number;
        [ResourceType.Kristal]?: number;
        [ResourceType.Deuterium]?: number;
    }
}

export type SettingsRequestModel = BaseRequestModel<ClientSettings>;