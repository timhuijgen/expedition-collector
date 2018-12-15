import {ResourceType} from "../matchers/ResourceTypeMatcher";

export interface UserModel {
    _id?: string;
    userId: string;
    trading: string;
    fleetValue?: {
        [ResourceType.Metal]?: number;
        [ResourceType.Kristal]?: number;
        [ResourceType.Deuterium]?: number;
    };
}