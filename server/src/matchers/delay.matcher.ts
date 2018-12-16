import {Matcher} from "./matcher";

export class DelayMatcher extends Matcher {
    public matcher = [
        /later dan verwacht terugkeren/,
        /Daardoor is de terugkeer enigszins vertraagd/,
        /maar de sprong huiswaarts zal meer tijd in beslag nemen dan gedacht werd/,
        /Zodra de noodzakelijke reparaties zijn uitgevoerd zal de vloot huiswaarts keren/
    ];
}