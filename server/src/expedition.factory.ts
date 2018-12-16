import moment from 'moment';
import {ClientExpeditionReport} from "./http/endpoints/addExpedition/add-expedition.model";
import {ExpeditionModel} from "./database/expedition/expedition.model";
import {ExpeditionParser} from "./expedition.parser";

export function expeditionFactory(userId: string, expeditionReport: ClientExpeditionReport): ExpeditionModel {
    const parser = new ExpeditionParser(expeditionReport.content);
    return {
        userId: userId,
        messageId: expeditionReport.messageId,
        date: +moment(expeditionReport.date, 'DD.MM.YYYY HH:mm:ss').format('x'),
        location: expeditionReport.location,
        content: expeditionReport.content,
        nothing: parser.isNothing(),
        value: parser.getValue(),
        delay: parser.getProperty('delay'),
        speed: parser.getProperty('speed'),
        pirates: parser.getProperty('pirates'),
        aliens: parser.getProperty('aliens'),
        destroyed: parser.getProperty('destroyed'),
        fleet: parser.getProperty('fleet'),
        resources: parser.getProperty('resources'),
        resourceType: parser.getProperty('resourceType'),
        item: parser.getProperty('item'),
        trader: parser.getProperty('trader')
    };
}