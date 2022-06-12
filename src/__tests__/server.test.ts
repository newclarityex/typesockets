import { createServerEndpoints, createServer } from "../Server";
import type { WebSocketServer } from "ws";
import { w3cwebsocket as WebSocket } from "websocket";

describe("server endpoints can be defined and used", () => {
    let server: WebSocketServer;
    let clientWs: WebSocket;
    let serverEndpoints = createServerEndpoints({
        increment: () => { },
        incrementBy: (amount: number) => { },
        incrementMultiple: (amount: number, times: number) => { }
    });
    let counter = 0;

    function createServerAndClient() {
        return new Promise((resolve: (value: void) => void) => {
            server = createServer({ port: 8081 });

            let hydratedEndpoints = serverEndpoints.hydrate({
                increment: (ws) => {
                    console.log("incremented");

                    counter++;
                },
                incrementBy: (ws, amount: number) => {
                    counter += amount;
                },
                incrementMultiple: (ws, amount: number, times: number) => {
                    counter += amount * times;
                }
            });

            hydratedEndpoints.attachServer(server);

            clientWs = new WebSocket("ws://localhost:8081");
            clientWs.onopen = () => {
                resolve();
            }
        });
    }

    function waitUntilMessage() {
        return new Promise((resolve: (value: void) => void) => {
            // janky but don't a better way to do this
            setTimeout(() => {
                resolve();
            }, 2000);
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

    it("should be able to define server endpoints", async () => {
        const { increment } = serverEndpoints.extracted;
        increment(clientWs as any);
        await waitUntilMessage();
        expect(counter).toBe(1);
    });

    it("should be able to pass arguments to server endpoints", async () => {
        const { incrementBy } = serverEndpoints.extracted;
        incrementBy(clientWs as any, 2);
        await waitUntilMessage();
        expect(counter).toBe(2);
    });

    it("should be able to pass multiple arguments to server endpoints", async () => {
        const { incrementMultiple } = serverEndpoints.extracted;
        incrementMultiple(clientWs as any, 2, 3);
        await waitUntilMessage();
        expect(counter).toBe(6);
    });
});