import Express from 'express';
import {UserStore} from './database/user/user.store';
import {ExpeditionStore} from "./database/expedition/expedition.store";
import {Context} from "./context.model";
import {Router} from "./http/router";

async function run() {
    const express = Express();
    express.listen(8877, () => console.log('Express Listening on port 8877'));

    const userStore = new UserStore();
    const expeditionStore = new ExpeditionStore();

    await userStore.load();
    await expeditionStore.load();

    const context: Context = {
        database: {
            user: userStore,
            expedition: expeditionStore
        }
    };
    new Router(express, context);
}

run().then(() => {
    console.log('Server booted successfully');
})
.catch((err) => {
    console.error(err);
});