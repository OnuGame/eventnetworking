import { BaseEvent, EventSystem } from "@lebogo/eventsystem";
import { Server as WSServer } from "ws";
import { randomUUID } from "crypto";
import { ClientConnection } from "./ClientConnection";
import { ClientConnectedEvent } from "./events/ClientConnectedEvent";
import { ClientConnectionOptions } from "./ClientConnectionOptions";
import { ClientReconnectResponseEvent } from "./events/ClientReconnectResponseEvent";
import { ClientDisconnectEvent } from "./events/ClientDisconnectEvent";
import { ClientDisconnectedEvent } from "./events/ClientDisconnectedEvent";

export class Server extends EventSystem {
    clients: Map<string, ClientConnection> = new Map();

    constructor(private wss: WSServer, private clientConnectionOptions?: ClientConnectionOptions) {
        super();
        this.init();
    }

    private init() {
        this.wss.on("connection", (socket) => {
            const clientId = randomUUID();

            const connection = new ClientConnection(socket, clientId, this.clientConnectionOptions);
            connection.registerEvent<ClientReconnectResponseEvent>(
                "ClientReconnectResponseEvent",
                (event) => {
                    const existingConnection = this.clients.get(event.clientId);
                    if (!existingConnection) {
                        return;
                    }
                    existingConnection.reconnect(socket);
                    connection.unsetSocket(false);
                }
            );

            connection.registerEvent<ClientConnectedEvent>("ClientConnectedEvent", () => {
                this.clients.set(clientId, connection);
                this.emit(new ClientConnectedEvent(connection));
            });

            connection.registerEvent<ClientDisconnectEvent>("ClientDisconnectEvent", () => {
                this.clients.delete(clientId);
                this.emit(new ClientDisconnectedEvent());
            });
        });
    }

    getClients(): ClientConnection[] {
        return [...this.clients.values()];
    }

    /**
     * Broadcasts an event to every connected client.
     * @param event The event to broadcast.
     */
    broadcast(event: BaseEvent) {
        for (let client of this.clients.values()) {
            client.send(event);
        }
    }
}
