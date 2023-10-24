import { BaseEvent } from "@lebogo/eventsystem";

export class MyCustomEvent extends BaseEvent {
    constructor(public text: string) {
        super("MyCustomEvent");
    }
}
