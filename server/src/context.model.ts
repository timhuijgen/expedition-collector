import {ExpeditionStore} from "./database/expedition/expedition.store";
import {UserStore} from "./database/user/user.store";

export interface Context {
    database: {
        expedition: ExpeditionStore;
        user: UserStore
    }
}