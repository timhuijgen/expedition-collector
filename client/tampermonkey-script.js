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

const config = {
    server: {
        url: 'http://localhost',
        port: 8877
    },
    endpoints: {
        saved: '/saved',
        add: '/add'
    },
    queryInterval: 5000,
    syncInterval: 500
};

class CollectExpoResults {
    constructor() {
        this.queryInterval = null;
        this.expoReports = [];
        this.savedReports = [];
        this.httpClient = new HttpClient();
    }

    initialize() {
        this.httpClient.fetchSavedReports((saved) => {
            this.savedReports = saved;
            this.start();
            setTimeout(() => {
                this.stop();
            }, 20000);
        });
    }

    start() {
        this.queryInterval = setInterval(this.readResults.bind(this), config.queryInterval);
        this.syncInterval = setInterval(this.sync.bind(this), config.syncInterval);
    }

    stop() {
        clearInterval(this.queryInterval);
        clearInterval(this.syncInterval);
    }

    sync() {
        const report = this.expoReports.shift();
        if(!report) {
            return false;
        }
        if(this.savedReports.indexOf(report.id) !== -1) {
            return;
        }

        this.setReportAsSaved(report);
        this.httpClient.saveReport(report, (result) => {
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
        messages.forEach((message) => {
            if (message.querySelector('.msg_title').innerHTML.indexOf('Expeditieresultaat') > -1) {
                const id = +message.dataset.msgId;
                if(this.savedReports.indexOf(id) === -1) {
                    this.expoReports.push(this.parseMessage(message));
                }
            }
        });

        this.savedReports.forEach(reportId => {
            this.setReportAsSaved({id: reportId});
        });
    }

    setReportAsSaved(report) {
        this.savedReports.push(report.id);
        const msg = document.querySelector(`[data-msg-id="${report.id}"]`);
        if(!msg) {
            return false;
        }
        if(!msg.querySelector('.expo-saved')) {
            const el = document.createElement('span');
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

    buildServerUrl(endpoint) {
        return `${config.server.url}:${config.server.port}${endpoint}`;
    }

    fetchSavedReports(cb) {
        fetch(this.buildServerUrl(config.endpoints.saved))
            .then(response => response.json())
            .then((saved) => {
                cb(saved);
            })
            .catch(err => console.error);
    }

    saveReport(report, cb) {
        fetch(this.buildServerUrl(config.endpoints.add), {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(report),
        })
            .then((res) => res.json())
            .then((result) => {
                cb(result);
            });
    }
}

new CollectExpoResults().initialize();

]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);