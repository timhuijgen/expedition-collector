import {Matcher} from "./matcher";

export enum ResourceType {
    None = 0,
    Metal = 1,
    Kristal = 2,
    Deuterium = 3,
    DarkMatter = 4
}

export class ResourceTypeMatcher extends Matcher {
    public matcher = /Er is (\w*\s?\w*?)\s? ([0-9]+\.?[0-9]+\.?[0-9]+\.?[0-9]+) buitgemaakt/;

    public match(content: string): number | boolean {
        const isResource = this.matcher.test(content);
        if(!isResource) {
            return false;
        }
        const results = this.matcher.exec(content);
        if(!results) {
            return false;
        }
        switch(results[1].trim()) {
            case 'Metaal':
                return ResourceType.Metal;
            case 'Kristal':
                return ResourceType.Kristal;
            case 'Deuterium':
                return ResourceType.Deuterium;
            case 'Donkere Materie':
                return ResourceType.DarkMatter;
            default:
                console.error(`Resource type ${results[1]} not found.`);
                return -1;
        }
    }
}