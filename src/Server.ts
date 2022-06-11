import type { WebSocketServer, WebSocket } from "ws";

export default function createServerEndpoints<T extends Record<string, (...args: any[]) => any>>(wss: WebSocketServer, endpoints: T): { endpoints: T; extractEndpoints(): { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void } } {
    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            const { type, payload } = JSON.parse(message.toString());
            if (type in endpoints) {
                endpoints[type](ws, ...payload);
            }
        });
    });
    return {
        endpoints,
        extractEndpoints() {
            return Object.fromEntries(Object.keys(endpoints).map((key) => [key, (ws: WebSocket, ...args) => ws.send(JSON.stringify({
                type: key,
                payload: args,
            }))])) as { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void };
        }
    }
}