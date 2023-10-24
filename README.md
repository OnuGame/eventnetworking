# EventNetworking

Onu2's event system with network capabilities for clients and servers.

This is a wrapper around standard WebSocket connections, which allows you to send and receive type-safe events between clients and servers.
EventNetworking can handle reconnects if a WebSocket connection is lost.

## Installation

## Usage

> **Note:** The following examples are also included in the [example](./example) folder and can be used as a starting point for your own project.
>
> The client utilizes Vite as a bundler, while the server and shared library are built using a conventional TypeScript + Node.js configuration.

### Shared Events

The shared events are the most important part of EventNetworking. They define your event structure and ensure type safety between clients and servers.

Here is an example of a custom event:

```ts
import { BaseEvent } from "@lebogo/eventsystem";

export class MyCustomEvent extends BaseEvent {
    constructor(public text: string) {
        super("MyCustomEvent");
    }
}
```

### Server

As previously mentioned, EventNetworking is a wrapper around standard WebSocket connections.
The Server is based on the [ws](https://www.npmjs.com/package/ws) package.

```ts
import { Server as WSServer } from "ws";
import { Server, ClientConnectedEvent, ClientDisconnectedEvent } from "@onu2/event-networking";
import { MyCustomEvent } from "shared"; // Import the shared event from the shared package

const wsServer = new WSServer({
    port: 8080,
});

const server = new Server(wsServer);

server.registerEvent<ClientConnectedEvent>("ClientConnectedEvent", (event) => {
    const connection = event.connection!;

    connection.registerEvent<MyCustomEvent>("MyCustomEvent", (event) => {
        console.log(`Received custom event from client ${connection.id}: ${event.text}`);
    });

    connection.registerEvent<ClientDisconnectedEvent>("ClientDisconnectedEvent", () => {
        console.log(`Client ${connection.id} disconnected.`);
    });

    // Send a custom event to the client
    connection.send(new MyCustomEvent("Hello from the server!"));
});
```

### Client

The Client behaves slightly different than the Server.
It directly implements the Browser's WebSocket API and is not based on any package.

```ts
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
```
