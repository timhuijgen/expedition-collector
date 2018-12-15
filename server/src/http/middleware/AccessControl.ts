import {Request, Response} from 'express';

export default function(request: Request, response: Response, next: Function) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}