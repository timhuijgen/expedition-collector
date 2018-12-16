import {Request, Response, Express} from "express";
import bodyParser from 'body-parser';
import {queryUserIdMiddleware} from "./middleware/query-user-id";
import {accessControlMiddleware} from "./middleware/access-control";
import {Context} from "../context.model";
import {AddExpeditionHandler} from "./endpoints/addExpedition/add-expedition.handler";
import {SettingsHandler} from "./endpoints/settings/settings.handler";
import {SavedExpeditionsHandler} from "./endpoints/savedExpeditions/saved-expeditions.handler";

export class Router {
    constructor(private httpClient: Express, private context: Context) {
        httpClient.use(accessControlMiddleware);
        httpClient.use(queryUserIdMiddleware);
        httpClient.use(bodyParser.json());

        httpClient.get('/saved', this.handle.bind(this, SavedExpeditionsHandler));
        httpClient.post('/add', this.handle.bind(this, AddExpeditionHandler));
        httpClient.post('/settings', this.handle.bind(this, SettingsHandler));
    }

    async handle(handlerClass: any, request: Request, response: Response) {
        const handler = new handlerClass(this.context);
        try {
            await handler.handle(request, response);
        } catch (err) {
            handler.error(response, err.message);
        }
    }
}