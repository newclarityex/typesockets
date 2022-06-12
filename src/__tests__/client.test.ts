import { createClientEndpoints } from "../Client";
import { createServer } from "../Server";
import type { WebSocketServer } from "ws";
import { w3cwebsocket as WebSocket } from "websocket";

describe("client endpoints can be defined and used", () => {
    let server: WebSocketServer;
    let serverSideClient: any;
    let clientWs: WebSocket;
    let counter = 0;
    let clientEndpoints = createClientEndpoints({
        increment: () => {
            counter++;
        },
        incrementBy: (amount: number) => {
            counter += amount;
        },
        incrementMultiple: (amount: number, times: number) => {
            counter += amount * times;
        }
    });

    function createServerAndClient() {
        return new Promise((resolve: (value: void) => void) => {
            server = createServer({ port: 8080 });
            clientWs = new WebSocket("ws://localhost:8080");

            clientEndpoints.attachClient(clientWs as any);

            server.on("connection", (ws) => {
                serverSideClient = ws;
                resolve();
            });
        });
    }

    function waitUntilMessage() {
        return new Promise((resolve: (value: void) => void) => {
            // janky but don't a better way to do this
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    beforeEach(async () => {
        await createServerAndClient();
        counter = 0;
    });

    afterEach(() => {
        server.close();
        clientWs.close();
    });

    it("should be able to define client endpoints", async () => {
        const { increment } = clientEndpoints.extracted;
        increment(serverSideClient);
        await waitUntilMessage();
        expect(counter).toBe(1);
    });

    it("should be able to pass arguments to client endpoints", async () => {
        const { incrementBy } = clientEndpoints.extracted;
        incrementBy(serverSideClient, 2);
        await waitUntilMessage();
        expect(counter).toBe(2);
    });

    it("should be able to pass multiple arguments to client endpoints", async () => {
        const { incrementMultiple } = clientEndpoints.extracted;
        incrementMultiple(serverSideClient, 2, 3);
        await waitUntilMessage();
        expect(counter).toBe(6);
    });
});