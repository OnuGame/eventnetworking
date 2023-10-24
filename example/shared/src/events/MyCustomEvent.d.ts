import { BaseEvent } from "@lebogo/eventsystem";
export declare class MyCustomEvent extends BaseEvent {
    text: string;
    constructor(text: string);
}
