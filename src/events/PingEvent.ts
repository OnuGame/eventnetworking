import { BaseEvent } from "@lebogo/eventsystem";

export class PingEvent extends BaseEvent {
    constructor(public ts: number) {
        super("PingEvent");
    }
}
