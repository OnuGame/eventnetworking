import { BaseEvent } from "@lebogo/eventsystem";

export class ClientTimedOutEvent extends BaseEvent {
    constructor() {
        super("ClientTimedOutEvent");
    }
}
