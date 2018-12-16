import NeDB from 'nedb';

export abstract class BaseStore {
    protected abstract storeName: string;
    protected abstract store: NeDB;
    protected abstract uniqueFields: string[] = [];

    public async load() {
        await new Promise((resolve, reject) => {
            this.store.loadDatabase((err: Error) => {
                if (err) {
                    console.error('Error while loading user store', err);
                    return reject(err);
                }
                console.log(`Store ${this.storeName} loaded`);
                resolve();
            });
        });

        const promises: Promise<void>[] = [];
        this.uniqueFields.forEach(field => {
            promises.push(new Promise((resolve, reject) => {
                this.store.ensureIndex({fieldName: field, unique: true}, (err: Error) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }));
        });

        await Promise.all(promises);
    }

    public compress(): void {
        return this.store.persistence.compactDatafile();
    }
}