export interface ClientConnectionOptions {
    /**
     * The interval in which the client should send ping events to the server.
     * If no ping event is received within the interval, the client will be disconnected.
     * @default 10000
     */
    pingInterval?: number;
}
