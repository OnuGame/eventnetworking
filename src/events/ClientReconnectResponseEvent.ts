import { BaseEvent } from "@lebogo/eventsystem";

export class ClientReconnectResponseEvent extends BaseEvent {
    constructor(public clientId: string) {
        super("ClientReconnectResponseEvent");
    }
}
