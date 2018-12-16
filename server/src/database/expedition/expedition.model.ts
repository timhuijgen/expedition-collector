export interface ExpeditionModel {
    _id?: string;
    userId: string;
    messageId: number;
    date: number;
    location: string;
    content: string;
    nothing: boolean;
    value: number;
    delay: boolean;
    speed: boolean;
    pirates: boolean;
    aliens: boolean;
    destroyed: boolean;
    fleet: boolean;
    resources: boolean;
    resourceType: number;
    item: boolean;
    trader: boolean;
}