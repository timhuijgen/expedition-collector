import NeDB from 'nedb';
import {BaseStore} from "../base.store";
import {UserModel} from "./user.model";

export class UserStore extends BaseStore {
    protected storeName = 'UserStore';
    protected store: NeDB;
    protected uniqueFields = ['userId'];

    constructor() {
        super();
        this.store = new NeDB({filename: 'server/data/userstore'});
    }

    public async getUser(id: string): Promise<UserModel> {
        return await new Promise((resolve, reject) => {
            this.store.findOne({userId: id}, (err: Error, user: UserModel) => {
                if(err) return reject(err);
                resolve(user);
            });
        });
    }

    public async addUser(user: UserModel): Promise<UserModel> {
        return await new Promise((resolve, reject) => {
            this.store.insert(user, (err: Error, newUser: UserModel) => {
                if(err) return reject(err);
                resolve();
            });
        });
    }

    public async updateUser(user: UserModel): Promise<void> {
        return await new Promise((resolve, reject) => {
            this.store.update({userId: user.userId}, {$set: user}, {}, (err: Error) => {
                if(err) return reject(err);
                resolve();
            });
        });
    }
}