import createClientEndpoints from "../Client";
import { WebSocketServer } from "ws";
import { w3cwebsocket as WebSocket } from "websocket";

describe("client endpoints can be defined and used", () => {
    let server: WebSocketServer;
    let serverSideClient: any;
    let clientWs: WebSocket;

    function createServerAndClient() {
        return new Promise((resolve: (value: void) => void) => {
            server = new WebSocketServer({ port: 8080 });
            clientWs = new WebSocket("ws://localhost:8080");
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
    });

    afterEach(() => {
        server.close();
        clientWs.close();
    });

    it("should be able to define client endpoints", async () => {
        let counter = 0;
        const clientEndpoints = createClientEndpoints(clientWs as any, {
            increment: () => {
                counter++;
            },
        });
        const { increment } = clientEndpoints.extractEndpoints();
        increment(serverSideClient);
        await waitUntilMessage();
        expect(counter).toBe(1);
    });

    it("should be able to pass arguments to client endpoints", async () => {
        let counter = 0;
        const clientEndpoints = createClientEndpoints(clientWs as any, {
            increment: (amount: number) => {
                counter += amount;
            }
        });
        const { increment } = clientEndpoints.extractEndpoints();
        increment(serverSideClient, 2);
        await waitUntilMessage();
        expect(counter).toBe(2);
    });

    it("should be able to pass multiple arguments to client endpoints", async () => {
        let counter = 0;
        const clientEndpoints = createClientEndpoints(clientWs as any, {
            increment: (amount: number, times: number) => {
                counter += amount * times;
            }
        });
        const { increment } = clientEndpoints.extractEndpoints();
        increment(serverSideClient, 2, 3);
        await waitUntilMessage();
        expect(counter).toBe(6);
    });
});