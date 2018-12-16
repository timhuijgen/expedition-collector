import {Matcher} from "./matcher";

export class ResourceMatcher extends Matcher {
    public matcher = /Er is (\w*\s?\w*?)\s? ([0-9]+\.?[0-9]+\.?[0-9]+\.?[0-9]+) buitgemaakt/;

    getValue(content: string): number {
        const results = this.matcher.exec(content);
        if(!results) {
            return 0;
        }
        return +results[2].trim().replace(/\./g, '');
    }
}