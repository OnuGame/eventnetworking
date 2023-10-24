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
