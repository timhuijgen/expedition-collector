import NeDB from 'nedb';
import {BaseStore} from "../base.store";
import {ExpeditionModel} from './expedition.model';

export class ExpeditionStore extends BaseStore {
    protected storeName = 'ExpeditionStore';
    protected store: NeDB;
    protected uniqueFields = ['messageId'];

    constructor() {
        super();
        this.store = new NeDB({filename: 'server/data/expostore'});
    }

    public async getUserSavedExpeditionIds(userId: string): Promise<number[]> {
        return await new Promise((resolve, reject) => {
            this.store.find({userId: userId}, {
                messageId: 1,
                _id: 0
            }).sort({date: -1}).limit(300).exec((err: Error, messages: {messageId: number}[]) => {
                if(err) return reject(err);
                resolve(messages.map((message: {messageId: number}) => message.messageId));
            });
        });
    }

    public async addExpedition(expedition: ExpeditionModel): Promise<ExpeditionModel> {
        return await new Promise((resolve, reject) => {
            this.store.insert(expedition, (err: Error, newExpedition: ExpeditionModel) => {
                if(err) return reject(err);
                resolve(newExpedition);
            });
        });
    }

    public async getAll() {
        return await new Promise((resolve, reject) => {
            this.store.find({}, (err: Error, expeditions: ExpeditionModel[]) => {
                if(err) return reject(err);
                resolve(expeditions);
            });
        });
    }
}