// ==UserScript==
// @name         ExpoCollector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  OGame expedition report collector
// @author       Timmey
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        https://s131-nl.ogame.gameforge.com/game/index.php?page=messages*
// ==/UserScript==


var inline_src = (<><![CDATA[

class CollectExpoResults {
    constructor() {
        this.queryInterval = null;
        this.expoReports = [];
        this.savedReports = [];
    }

    initialize() {
        httpClient.fetchSavedReports((saved) => {
            this.savedReports = saved;
            this.startQueryMessages();
        });
    }

    startQueryMessages() {
        console.log('Starting querying DOM for expedition reports');
        this.queryInterval = setInterval(this.readResults.bind(this), config.queryInterval);
    }

    startSync() {
        console.log('Starting sync expedition reports with server');
        this.syncInterval = setInterval(this.sync.bind(this), config.syncInterval);
    }

    stopSync() {
        console.log('Stopped sync expedition reports with server');
        if(this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }

    stopQueryMessages() {
        console.log('Stopping querying DOM for expedition reports');
        if(this.queryInterval) {
            clearInterval(this.queryInterval);
        }
    }

    sync() {
        console.log(this.savedReports);
        const report = this.expoReports.shift();
        if(!report) {
            this.stopSync();
            return;
        }
        if(this.savedReports.indexOf(report.id) !== -1) {
            return this.sync();
        }

        this.setReportAsSaved(report);
        httpClient.saveReport(report, (result) => {
            if(result.error) {
                console.log(result);
            }
        });

    }

    parseMessage(message) {
        const id = +message.dataset.msgId;
        const location = message.querySelector('.msg_title .txt_link').innerHTML.replace(/\[]/g, '');
        const date = message.querySelector('.msg_head .msg_date.fright').innerHTML;
        const content = message.querySelector('.msg_content').innerHTML;

        return {
            id,
            location,
            date,
            content
        };
    }


    readResults() {
        const messages = document.querySelectorAll('.msg');
        let messagesFound = false;
        messages.forEach((message) => {
            if (message.querySelector('.msg_title').innerHTML.indexOf('Expeditieresultaat') > -1) {
                messagesFound = true;
                const id = +message.dataset.msgId;
                if(this.savedReports.indexOf(id) === -1) {
                    this.expoReports.push(this.parseMessage(message));
                }
            }
        });

        if(messagesFound) {
            this.stopQueryMessages();
            this.startSync();
            this.savedReports.forEach(reportId => {
                this.setReportAsSaved({id: reportId});
            });
        }
    }

    setReportAsSaved(report) {
        this.savedReports.push(report.id);
        const msg = document.querySelector(`[data-msg-id="${report.id}"]`);
        if(!msg) {
            return false;
        }
        let el = msg.querySelector('.expo-saved');
        if(!el) {
            el = document.createElement('span');
            el.classList.add('expo-saved');
            el.style.width = '16px';
            el.style.height = '16px';
            el.style.backgroundColor = 'green';
            el.style.borderRadius = '50%';
            el.style.margin = '6px';
            el.style.display = 'inline-block';

            msg.querySelector('.msg_actions').insertAdjacentElement('afterbegin', el);
        }
    }
}

class HttpClient {

    constructor(config) {
        this.config = config;
    }

    buildServerUrl(endpoint) {
        return `${this.config.server.url}:${this.config.server.port}${endpoint}?userId=${this.config.userId}`;
    }

    fetchSavedReports(cb) {
        fetch(this.buildServerUrl(this.config.endpoints.saved))
            .then(response => response.json())
            .then((saved) => {
                cb(saved);
            })
            .catch(err => console.error);
    }

    saveReport(report, cb) {
        console.log(report);
        fetch(this.buildServerUrl(this.config.endpoints.add), {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(report)
        })
            .then((res) => res.json())
            .then((result) => {
                cb(result);
            });
    }

    setConfig(settings, cb) {
        fetch(this.buildServerUrl(this.config.endpoints.settings), {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(settings)
        })
            .then((res) => res.json())
            .then((result) => {
                cb(result);
            });
    }
}

class Config {
    constructor() {
        this.userId = null;
        this.newUser = false;
        this.server = {
            url: 'http://localhost',
            port: 8877
        };
        this.endpoints = {
            saved: '/saved',
            add: '/add',
            settings: '/settings'
        };
        this.queryInterval = 5000;
        this.syncInterval = 250;
        this.trading = '2.5-1.5-1';
        this.fleetValue = {
            metal: 1200000,
            kristal: 1201000
        };
    }

    load() {
        this.userId = storage.getUserId();

        if(!this.userId) {
            this.newUser = true;
            this.userId = uniqueUserId();
            storage.setUserId(this.userId);
            storage.setTrading(this.trading);
            storage.setFleetValue(this.fleetValue);
        }
        this.fleetValue = storage.getFleetValue();
        this.trading = storage.getTrading();

        return this;
    }

    update(httpClient, cb) {
        if(!this.newUser) {
            return;
        }
        return httpClient.setConfig({
            trading: this.trading,
            fleetValue: this.fleetValue
        }, (result) => {
            console.log('Result of saving settings', result);
            cb(result);
        });
    }
}

class Storage {
    constructor() {
        this._storgage = window.localStorage;
        this._prefix = 'ExpoCollector::';
    }

    get(prop) {
        return this._storgage.getItem(this._prefix + prop);
    }

    set(prop, value) {
        return this._storgage.setItem(this._prefix + prop, value);
    }

    getUserId() {
        return this.get('UserId');
    }

    setUserId(id) {
        return this.set('UserId', id);
    }

    getTrading() {
        return this.get('Trading');
    }

    setTrading(value) {
        return this.set('Trading', value);
    }

    getFleetValue() {
        return JSON.parse(this.get('FleetValue'));
    }

    setFleetValue(value) {
        return this.set('FleetValue', JSON.stringify(value))
    }
}

const storage = new Storage();
const config = new Config();
config.load();
const httpClient = new HttpClient(config);
config.update(httpClient, () => {});
new CollectExpoResults().initialize();

function uniqueUserId() {
    const results =
        /https:\/\/s(\d{2,4}-\w{2}).*&cp=(\d{1,10})/gm.exec(document.querySelector('#planetList a.planetlink').href);
    return `${results[1]}-${results[2]}`;
}

]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);