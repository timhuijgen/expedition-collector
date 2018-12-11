import Matcher from "./Matcher";

export default class DelayMatcher extends Matcher {
    public matcher = [
        /later dan verwacht terugkeren/,
        /Daardoor is de terugkeer enigszins vertraagd/
    ];
}