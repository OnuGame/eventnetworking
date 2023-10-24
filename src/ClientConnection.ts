import { BaseEvent, EventSystem } from "@lebogo/eventsystem";
import { PingEvent } from "./events/PingEvent";
import { WebSocket } from "ws";
import { ClientConnectionOptions } from "./ClientConnectionOptions";
import { ClientDisconnectedEvent } from "./events/ClientDisconnectedEvent";
import { ClientConnectedEvent } from "./events/ClientConnectedEvent";
import { ClientConnectRequestEvent } from "./events/ClientConnectRequestEvent";
import { ClientDisconnectEvent } from "./events/ClientDisconnectEvent";

export class ClientConnection extends EventSystem {
    private _id: string;
    /**
     * The id should never be transmitted to other clients.
     * This will be used to identify the client on the server for reconnects.
     * If other clients know this id, they can impersonate the client.
     */
    public get id(): string {
        return this._id;
    }

    private _socket: WebSocket;
    /**
     * Raw WebSocket connection of the client.
     */
    public get socket(): WebSocket {
        return this._socket;
    }

    private _ping: number = -1;

    /**
     * Ping of the client in milliseconds.
     */
    public get ping(): number {
        return this._ping;
    }

    private options: ClientConnectionOptions = {
        pingInterval: 10000,
    };

    private pingInterval?: NodeJS.Timeout;

    constructor(socket: WebSocket, id: string, options?: ClientConnectionOptions) {
        super();

        this._id = id;
        this._socket = socket;
        this.options = { ...this.options, ...options };

        this.initSocket();
        this.initClient();
    }

    private initSocket() {
        this._socket.on("message", this.messageReceived.bind(this));
        this._socket.on("close", () => {
            if (this.pingInterval) clearInterval(this.pingInterval);
        });

        this.initPing(this.options.pingInterval);
    }

    private initClient() {
        this.registerEvent("ClientConnectResponseEvent", () => {
            this.emit(new ClientConnectedEvent());
            this.unregisterEvent("ClientConnectResponseEvent");
        });

        this.registerEvent<ClientDisconnectEvent>("ClientDisconnectEvent", () => {
            this.disconnect(false);
        });

        this.send(new ClientConnectRequestEvent(this._id));
    }

    private initPing(pingInterval: number) {
        if (this.pingInterval) clearInterval(this.pingInterval);

        let pingPending = false;
        this.pingInterval = setInterval(() => {
            if (pingPending) {
                this.disconnect(false);
                return;
            }

            this.send(new PingEvent(Date.now()));
            pingPending = true;
        }, pingInterval);

        this.registerEvent<PingEvent>("PingEvent", (event) => {
            pingPending = false;
            const duration = Date.now() - event.ts;
            this._ping = duration;
        });
    }

    /**
     * Sends an event to the client.
     * @param event The event to send to the client.
     */
    send(event: BaseEvent) {
        this._socket.send(event.stringify());
    }

    /**
     * Reassigns and reinitializes the socket of the client connection.
     * @param socket The new socket to assign.
     */
    reconnect(socket: WebSocket) {
        this.unregisterEvent("ClientConnectResponseEvent");
        this._socket = socket;
        this.initSocket();
    }

    /**
     * Unsets the socket of the client connection.
     * This should not be called manually. It is called automatically when the client reconnects.
     *
     * Use disconnect() instead to disconnect the client.
     * @param closeSocket Whether the socket should be closed.
     */
    unsetSocket(closeSocket: boolean = true) {
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (closeSocket && this.socket.readyState === WebSocket.OPEN) {
            this._socket.close();
        }
        this._socket = undefined;
    }

    /**
     * Disconnects the client gracefully.
     */
    disconnect(notifyClient: boolean = true) {
        if (this.pingInterval) clearInterval(this.pingInterval);

        if (notifyClient) this.send(new ClientDisconnectEvent());

        this.emit(new ClientDisconnectedEvent());

        // Let the client receive the disconnect event so it can close the connection itself.
        // If the client does not close the connection within 100ms, the connection will be closed forcefully.
        setTimeout(() => {
            this.unsetSocket(true);
        }, 100);
    }

    private messageReceived(message: Buffer) {
        this.parse(message.toString());
    }
}
