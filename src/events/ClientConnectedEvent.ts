import { BaseEvent } from "@lebogo/eventsystem";
import { ClientConnection } from "../ClientConnection";

export class ClientConnectedEvent extends BaseEvent {
    constructor(public connection?: ClientConnection) {
        super("ClientConnectedEvent");
    }
}
