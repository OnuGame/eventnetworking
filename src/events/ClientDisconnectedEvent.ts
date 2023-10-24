import { BaseEvent } from "@lebogo/eventsystem";

export class ClientDisconnectedEvent extends BaseEvent {
    constructor() {
        super("ClientDisconnectedEvent");
    }
}
