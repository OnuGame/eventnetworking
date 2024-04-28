import { BaseEvent, EventSystem } from "@lebogo/eventsystem";
import { PingEvent } from "./events/PingEvent";
import { ClientConnectRequestEvent } from "./events/ClientConnectRequestEvent";
import { ClientConnectResponseEvent } from "./events/ClientConnectResponseEvent";
import { ClientReconnectResponseEvent } from "./events/ClientReconnectResponseEvent";
import { ClientDisconnectEvent } from "./events/ClientDisconnectEvent";
import { ClientDisconnectedEvent } from "./events/ClientDisconnectedEvent";

export class Client extends EventSystem {
    private ws: WebSocket;
    private allowReconnect: boolean = true;
    private isReconnecting: boolean = false;
    private clientId: string;
    private reconnectAttempts: number = 0;

    /**
     * Creates a new client connection and connects to the server.
     * @param url The url to connect to.
     */
    constructor(private url: string) {
        super();

        this.connect();
    }

    private initWebsocket() {
        this.ws = new WebSocket(this.url);

        this.ws.onmessage = (message) => this.messageReceived(message.data);
        this.ws.onclose = () => {
            if (this.allowReconnect) {
                this.isReconnecting = true;
                this.initWebsocket();

                if (this.reconnectAttempts > 3) {
                    this.allowReconnect = false;
                    this.reconnectAttempts = 0;
                }

                this.reconnectAttempts++;
            } else {
                this.disconnect(false);
            }
        };
    }

    private init() {
        this.initWebsocket();

        this.registerEvent<ClientConnectRequestEvent>(
            "ClientConnectRequestEvent",
            ({ clientId }) => {
                if (this.isReconnecting) {
                    this.send(new ClientReconnectResponseEvent(this.clientId));
                    this.isReconnecting = false;
                    // TODO | What if server can't reconnect the client because it's not found?
                    // TODO | -> Implement a server response to handle this case.
                    return;
                }

                // Reply with client connect response event to confirm connection.
                this.send(new ClientConnectResponseEvent());
                this.clientId = clientId;
            }
        );

        this.registerEvent<PingEvent>("PingEvent", (event) => {
            // Reply with the same event.
            this.send(event);
        });

        this.registerEvent<ClientDisconnectEvent>("ClientDisconnectEvent", () => {
            this.disconnect(false);
        });
    }

    /**
     * Sends an event to the server.
     * @param event The event to send to the server.
     */
    send(event: BaseEvent) {
        this.ws.send(event.stringify());
    }

    /**
     * Disconnects from the server gracefully.
     */
    disconnect(notifyServer: boolean = true) {
        this.allowReconnect = false;
        if (notifyServer) this.send(new ClientDisconnectEvent());
        this.emit(new ClientDisconnectedEvent());
        setTimeout(() => {
            this.ws.close();
        }, 50);
    }

    /**
     * Starts the connection to the server.
     */
    connect() {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            this.init();
        }
    }

    private messageReceived(message: string) {
        this.parse(message);
    }
}
