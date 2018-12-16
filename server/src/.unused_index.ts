import Express from 'express';
import {ExpeditionParser} from "./expedition.parser";
import {ResourceType} from "./matchers/resource-type.matcher";
import {FleetMatcher} from "./matchers/fleet.matcher";

const BodyParser = require('body-parser');
const Database = require('nedb');
const Moment = require('moment');

const express = Express();
express.listen(8877, () => console.log('Listening on port 8877'));
express.use(BodyParser.json());
express.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
express.use(function(req, res, next) {
    if(!req.query.userId) {
        console.log('No user id provided');
        return res.json({error: 1, message: 'No user id provided'});
    }
    next();
});

const ExpoStore = new Database({filename: 'server/data/expostore'});
ExpoStore.ensureIndex({fieldName: 'messageId', unique: true}, (err: any) => {
    if (err) console.error('Error while trying to make messageId unique', err);
});
ExpoStore.loadDatabase((err: any) => {
    if (err) return console.error('Error while loading expostore', err);

    console.log('Expostore loaded');
});

const UserStore = new Database({filename: 'server/data/userstore'});
UserStore.ensureIndex({fieldName: 'userId', unique: true}, (err: any) => {
    if (err) console.error('Error while trying to make userId unique', err);
});
UserStore.loadDatabase((err: any) => {
    if (err) return console.error('Error while loading user store', err);

    console.log('UserStore loaded');
});

express.get('/saved', (req, res) => {
    const userId = req.query.userId;
    ExpoStore.find({userId: userId}, {
        messageId: 1,
        _id: 0
    }).sort({date: -1}).limit(300).exec((err: any, messages: { [key: string]: {messageId: number}}[]) => {
        res.json(messages.map(message => message.messageId));
    });
});

express.post('/add', (req, res) => {
    const userId = req.query.userId;
    insertResult({userId: userId, ...req.body}, (err: any) => {
        if (err) {
            return res.json({error: 1, message: err.message});
        }
        res.json({error: null, message: 'success'});
    });
});

interface User {
    userId: string;
    trading: string;
    fleetValue?: {
        [ResourceType.Metal]?: number;
        [ResourceType.Kristal]?: number;
        [ResourceType.Deuterium]?: number;
    };
}

express.post('/settings', (req, res) => {
    console.log('/settings', req.body);
    UserStore.findOne({userId: req.query.userId}, (err: any, user: User) => {
        if(user) {
            return UserStore.update({userId: req.query.userId}, {$set: {
                trading: req.body.trading,
                fleetValue: req.body.fleetValue
            }}, {}, (err: any) => {
                console.log('UserStore %s settings updated', req.query.userId);
                res.json({error: !!err});
            });
        }
        UserStore.insert({
            userId: req.query.userId,
            trading: req.body.trading,
            fleetValue: req.body.fleetValue
        }, (err: any, doc: User) => {
            console.log('UserStore %s added', req.query.userId);
            res.json({error: !!err});
        });
    });
});

express.post('/test', (req, res) => {
    const parser = new ExpeditionParser(req.body.teststring).parse();
    console.log(parser.getValue());
    console.log(parser.getProperty('fleet'));
    res.send({});
});

interface ExpoResult {
    id: number
    userId: string;
    date: string
    location: string
    content: string
}

interface ExpoModel {
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

function insertResult(data: ExpoResult, cb: Function) {
    const parser = new ExpeditionParser(data.content).parse();
    const expoResult: ExpoModel = {
        userId: data.userId,
        messageId: data.id,
        date: +Moment(data.date, 'DD.MM.YYYY HH:mm:ss').format('x'),
        location: data.location,
        content: data.content,
        nothing: parser.isNothing(),
        value: parser.getValue(),
        delay: parser.getProperty('delay'),
        speed: parser.getProperty('speed'),
        pirates: parser.getProperty('pirates'),
        aliens: parser.getProperty('aliens'),
        destroyed: parser.getProperty('destroyed'),
        fleet: parser.getProperty('fleet'),
        resources: parser.getProperty('resources'),
        resourceType: parser.getProperty('resourceType'),
        item: parser.getProperty('item'),
        trader: parser.getProperty('trader')
    };

    ExpoStore.insert(expoResult, (err: any, doc: ExpoModel) => {
        if (err) {
            console.error('Error inserting expo result', err.message);
            return cb(err);
        }

        cb();
        console.log('Expo result inserted successfully: UserId: %s, MessageId: %s', doc.userId, doc.messageId);
    });
}

function stats() {
    ExpoStore.find({}, (err: any, docs: ExpoModel[]) => {
        docs.sort((a: ExpoModel, b: ExpoModel) => a.date - b.date);
        const totalValueGenerated = docs.reduce((value, doc) => {
            return value + doc.value;
        }, 0);
        const totalValueMSE = docs.reduce((value, doc: ExpoModel) => {
            if(doc.resources) {
                switch(doc.resourceType) {
                    case ResourceType.Kristal:
                        return value + (doc.value * 1.9);
                    case ResourceType.Deuterium:
                        return value + (doc.value * 2.8);
                    case ResourceType.DarkMatter:
                        return value; // + (doc.value * 100);
                }
            }
            if(doc.fleet) {
                return value + (new FleetMatcher().getValue(doc.content, true));
            }
            return value + doc.value;
        }, 0);
        const firstDate = Moment(docs[0].date);
        const lastDate = Moment(docs[docs.length - 1].date);
        const hours = lastDate.diff(firstDate, 'hours');

        console.log('Total reports: ' + docs.length);
        console.log('Reports span a range of: %s hours', hours);
        console.log('Average Expeditions per day: ', docs.length / (hours/24));
        console.log('Average Value per day: ', totalValueGenerated / (hours/24));
        console.log('Average Value MSE per day: ', totalValueMSE / (hours/24));
        console.log('Total Value: ' + totalValueGenerated);
        console.log('Total Value MSE: ' + totalValueMSE);
        console.log('Average Value per expedition: ' + Math.floor(totalValueGenerated / docs.length));
        console.log('Average Value MSE per expedition: ' + Math.floor(totalValueMSE / docs.length));
    });
}

function getInputFromArgv(arg: string) {
    let match = process.argv.find(argument => {
        return argument.substr(0, arg.length + 3) === `--${arg}=`;
    });

    if (match) {
        return match.substr(arg.length + 3);
    }
    return false;
}

if (getInputFromArgv('update')) {
    ExpoStore.find({}, (err: any, results: ExpoModel[]) => {
        if (err) return console.error(err.message);

        console.log(`Updating ${results.length} Records ..`);

        let counter = 0;
        results.forEach((report: ExpoModel) => {
            const parser = new ExpeditionParser(report.content).parse();
            const newReport = {
                nothing: parser.isNothing(),
                value: parser.getValue(),
                delay: parser.getProperty('delay'),
                speed: parser.getProperty('speed'),
                pirates: parser.getProperty('pirates'),
                aliens: parser.getProperty('aliens'),
                destroyed: parser.getProperty('destroyed'),
                fleet: parser.getProperty('fleet'),
                resources: parser.getProperty('resources'),
                resourceType: parser.getProperty('resourceType'),
                item: parser.getProperty('item'),
                trader: parser.getProperty('trader')
            };
            ExpoStore.update({messageId: report.messageId}, {$set: newReport}, {}, (err: any, result: any) => {
                if(err) return console.error(err.message);
                counter += 1;
                done(counter);
            });
            const done = (c: number) => {
                if(c === results.length) {
                    console.log('Updates done .. Compressing Datafile ..');
                    ExpoStore.persistence.compactDatafile();
                    console.log('Done');
                }
            };
        });
    });

}


stats();



process.once('uncaughtException', function (err) {
    console.error('FATAL: Uncaught exception.');
    console.error(err.stack || err);
    setTimeout(function () {
        process.exit(1);
    }, 100);
});