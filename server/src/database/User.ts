import NeDB from 'nedb';
import Datastore from "./Datastore";
import {UserModel} from "./User.model";

export default class User extends Datastore {
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
            this.store.insert(user, (err: any, newUser: UserModel) => {
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