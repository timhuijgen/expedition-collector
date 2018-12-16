import {FleetMatcher} from './matchers/fleet.matcher';
import {SpeedMatcher} from './matchers/speed.matcher';
import {DelayMatcher} from './matchers/delay.matcher';
import {PiratesMatcher} from './matchers/pirates.matcher';
import {DestroyedMatcher} from './matchers/destroyed.matcher';
import {AliensMatcher} from './matchers/aliens.matcher';
import {ResourceMatcher} from './matchers/resource.matcher';
import {ItemMatcher} from './matchers/item.matcher';
import {TraderMatcher} from './matchers/trader.matcher';
import {Matcher} from './matchers/matcher';
import {ResourceTypeMatcher} from './matchers/resource-type.matcher';

export class ExpeditionParser {
    private value: number = 0;
    private expoResults: {property: string, value: boolean|number}[] = [];
    private noResult: boolean = true;
    private expoOutcomes: {matcher: Matcher, property: string, provideValue?: boolean}[] = [
        {matcher: new SpeedMatcher(), property: 'speed'},
        {matcher: new DelayMatcher(), property: 'delay'},
        {matcher: new DestroyedMatcher(), property: 'destroyed'},
        {matcher: new PiratesMatcher(), property: 'pirates'},
        {matcher: new AliensMatcher(), property: 'aliens'},
        {matcher: new FleetMatcher(), property: 'fleet', provideValue: true},
        {matcher: new ResourceMatcher(), property: 'resources', provideValue: true},
        {matcher: new ResourceTypeMatcher(), property: 'resourceType', provideValue: false},
        {matcher: new ItemMatcher(), property: 'item'},
        {matcher: new TraderMatcher(), property: 'trader'}
    ];

    constructor(private readonly content: string) {
    }

    public parse(): ExpeditionParser {
        this.expoOutcomes.forEach(outcome => {
            this.expoResults.push({
                property: outcome.property,
                value: outcome.matcher.match(this.content)
            });

            if(outcome.provideValue && outcome.matcher.match(this.content)) {
                this.value = outcome.matcher.getValue(this.content);
            }
        });
        this.noResult = this.expoResults.every(result => result.value === false);

        return this;
    }

    public isNothing() {
        return this.noResult;
    }

    public getValue(): number {
        return this.value;
    }

    public getProperty(property: string): any {
        const prop = this.expoResults.find(result => result.property === property);
        if(!prop) {
            console.error(`Property ${property} not found.`);
            return false;
        }
        return prop.value;
    }
}