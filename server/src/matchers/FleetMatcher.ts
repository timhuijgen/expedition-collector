import Matcher from "./Matcher";
import {ResourceType} from "./ResourceTypeMatcher";

const shipValues:{[ship: string]: {[resourceType: number]: number}} = {
    'licht gevechtsschip': {
        [ResourceType.Metal]: 3000,
        [ResourceType.Kristal]: 1000
    },
    'zwaar gevechtsschip': {
        [ResourceType.Metal]: 6000,
        [ResourceType.Kristal]: 4000
    },
    'kruiser': {
        [ResourceType.Metal]: 20000,
        [ResourceType.Kristal]: 7000,
        [ResourceType.Deuterium]: 2000
    },
    'slagschip': {
        [ResourceType.Metal]: 45000,
        [ResourceType.Kristal]: 15000
    },
    'interceptor': {
        [ResourceType.Metal]: 30000,
        [ResourceType.Kristal]: 40000,
        [ResourceType.Deuterium]: 15000
    },
    'bommenwerper': {
        [ResourceType.Metal]: 50000,
        [ResourceType.Kristal]: 25000,
        [ResourceType.Deuterium]: 15000
    },
    'vernietiger': {
        [ResourceType.Metal]: 60000,
        [ResourceType.Kristal]: 50000,
        [ResourceType.Deuterium]: 15000
    },
    'klein vrachtschip': {
        [ResourceType.Metal]: 2000,
        [ResourceType.Kristal]: 2000
    },
    'groot vrachtschip': {
        [ResourceType.Metal]: 6000,
        [ResourceType.Kristal]: 6000
    },
    'spionagesonde': {
        [ResourceType.Kristal]: 1000
    }
};

function shipTotalValue(ship:string, mse:boolean = false) {
    if (!shipValues[ship]) return 0;
    let value = 0;
    for (let resourceKey in shipValues[ship]) {
        if (!shipValues[ship].hasOwnProperty(resourceKey)) {
            continue;
        }
        if (mse === false) {
            value += shipValues[ship][resourceKey];
            continue;
        }
        switch (+resourceKey) {
            case ResourceType.Kristal:
                value += shipValues[ship][resourceKey] * 1.9;
                break;
            case ResourceType.Deuterium:
                value += shipValues[ship][resourceKey] * 2.8;
                break;
            default:
                value += shipValues[ship][resourceKey];
        }
    }
    return value;
}

export default class FleetMatcher extends Matcher {
    public matcher = /De volgende schepen zijn nu een deel van de vloot:/;

    public getValue(content:string, mse:boolean = false):number {
        const regex = /(\w*?\s?\w*?\s?): (\d{1,})(?:<br>)?(?:\s)?/gm;
        let m;
        let value = 0;
        while ((m = regex.exec(content)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            const shipName = m[1].trim().toLowerCase();
            const amount = parseInt(m[2].trim());
            if (!amount) {
                continue;
            }
            if (shipValues.hasOwnProperty(shipName)) {
                value += amount * shipTotalValue(shipName, mse);
            } else {
                console.error(`Ship ${shipName} not found`);
            }
        }

        return value;
    }
}