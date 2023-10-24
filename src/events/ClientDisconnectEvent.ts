import { BaseEvent } from "@lebogo/eventsystem";

export class ClientDisconnectEvent extends BaseEvent {
    constructor() {
        super("ClientDisconnectEvent");
    }
}
