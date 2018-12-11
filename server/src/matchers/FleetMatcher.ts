import Matcher from "./Matcher";

export default class FleetMatcher extends Matcher {
    public matcher = /De volgende schepen zijn nu een deel van de vloot:/;
    private shipMatcher = /(?:(.*): (\d{1,})(?:\s)?)/gm;

    public getValue(content: string) {
        const result = this.shipMatcher.exec(content);
        // console.log('result', result);
        return 0;
    }
}