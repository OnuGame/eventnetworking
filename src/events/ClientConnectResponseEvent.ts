import { BaseEvent } from "@lebogo/eventsystem";

export class ClientConnectResponseEvent extends BaseEvent {
    constructor() {
        super("ClientConnectResponseEvent");
    }
}
