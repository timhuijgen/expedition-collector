import {Matcher} from "./matcher";

export class AliensMatcher extends Matcher {
    public matcher = [
        /Onbekende exotisch ogende schepen vallen de expeditie zonder waarschuwing aan/,
        /Onze expeditie is aangevallen door een kleine vloot onbekende schepen/,
        /Je expeditievloot heeft een onvriendelijk eerste contact gemaakt met een onbekende levensvorm/
    ];
}