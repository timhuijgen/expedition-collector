import Express from 'express';
import ContentParser from "./ContentParser";

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

const DB = new Database({filename: 'server/data/datastore'});
DB.ensureIndex({fieldName: 'messageId', unique: true}, (err: any) => {
    if (err) console.error('Error while trying to make messageId unique', err);
});
DB.loadDatabase((err: any) => {
    if (err) return console.error('Error while loading datastore', err);

    console.log('Datastore loaded');
});

express.get('/saved', (req, res) => {
    DB.find({}, {
        messageId: 1,
        _id: 0
    }).sort({date: 1}).limit(200).exec((err: any, messages: { [key: string]: any }[]) => {
        res.json(messages.map(message => message.messageId));
    });
});

express.post('/add', (req, res) => {
    insertResult(req.body, (err: any) => {
        if (err) {
            return res.send({error: 1, message: err.message});
        }
        res.send({error: null, message: 'success'});
    });
});

express.post('/test', (req, res) => {
    const parser = new ContentParser(req.body.teststring).parse();
    console.log(parser.getValue());
    console.log(parser.getProperty('resources'));
    console.log(parser.getProperty('resourceType'));
    res.send({});
});

interface ExpoResult {
    id: number
    date: string
    location: string
    content: string
}

interface ExpoModel {
    _id?: string;
    messageId: number;
    date: number;
    location: string;
    content: string;
    nothing: boolean;
    value: number;
    delay: boolean | number;
    speed: boolean | number
    pirates: boolean | number;
    aliens: boolean | number;
    destroyed: boolean | number;
    fleet: boolean | number;
    resources: boolean | number;
    resourceType: boolean | number;
    item: boolean | number;
    trader: boolean | number;
}

function insertResult(data: ExpoResult, cb: Function) {
    const parser = new ContentParser(data.content).parse();
    const expoResult: ExpoModel = {
        messageId: data.id,
        date: +Moment(data.date, 'DD.MM.YYYY HH:mm:ss').format('x'), //10.12.2018 15:26:44
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

    DB.insert(expoResult, (err: any, doc: ExpoModel) => {
        if (err) {
            console.error('Error inserting expo result', err.message);
            return cb(err);
        }

        cb();
        console.log('Expo result inserted successfully: ', doc.messageId);
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
    DB.find({}, (err: any, results: ExpoModel[]) => {
        if (err) return console.error(err.message);

        results.forEach((report: ExpoModel) => {
            const parser = new ContentParser(report.content).parse();
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
            DB.update({messageId: report.messageId}, {$set: newReport}, {}, (err: any, result: any) => {
                if(err) return console.error(err.message);

                DB.persistence.compactDatafile();
            });
        });
    });

}

process.once('uncaughtException', function (err) {
    console.error('FATAL: Uncaught exception.');
    console.error(err.stack || err);
    setTimeout(function () {
        process.exit(1);
    }, 100);
});