import FleetMatcher from './matchers/FleetMatcher';
import SpeedMatcher from './matchers/SpeedMatcher';
import DelayMatcher from './matchers/DelayMatcher';
import PiratesMatcher from './matchers/PiratesMatcher';
import DestroyedMatcher from './matchers/DestroyedMatcher';
import AliensMatcher from './matchers/AliensMatcher';
import ResourceMatcher from './matchers/ResourceMatcher';
import ItemMatcher from './matchers/ItemMatcher';
import TraderMatcher from './matchers/TraderMatcher';
import Matcher from './matchers/Matcher';
import ResourceTypeMatcher from './matchers/ResourceTypeMatcher';

export default class ContentParser {
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

    public parse(): ContentParser {
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