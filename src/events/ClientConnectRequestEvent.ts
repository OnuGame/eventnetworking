import { BaseEvent } from "@lebogo/eventsystem";

export class ClientConnectRequestEvent extends BaseEvent {
    constructor(public clientId: string) {
        super("ClientConnectRequestEvent");
    }
}
