import { Client, ClientDisconnectedEvent } from "@onu2/event-networking";
import { MyCustomEvent } from "shared"; // Import the shared event from the shared package

const client = new Client("ws://localhost:8080");

client.registerEvent<MyCustomEvent>("MyCustomEvent", (event) => {
    console.log(`Received custom event with text: ${event.text}`);

    client.send(new MyCustomEvent("Hello server, this is client!"));
});

client.registerEvent<ClientDisconnectedEvent>("ClientDisconnectedEvent", () => {
    console.log("Disconnected from server.");
});
