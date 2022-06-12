import type { WebSocket } from "ws";

export function createClientEndpoints
    <T extends Record<string, (...args: any[]) => void>>(endpoints: T)
    : {
        attachClient: (client: WebSocket) => void,
        extracted: { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void }
    } {
    return {
        attachClient: (client: WebSocket) => {
            client.onmessage = (message) => {
                const { type, payload } = JSON.parse(message.data.toString());
                if (type in endpoints) {
                    endpoints[type](...payload);
                }
            }
        },
        extracted: Object.fromEntries(
            Object.keys(endpoints).map(
                (key) => [key, (ws: WebSocket, ...args) => ws.send(
                    JSON.stringify({
                        type: key,
                        payload: args,
                    })
                )]
            )
        )
    } as {
        attachClient: (client: WebSocket) => void,
        extracted: { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void }
    };
}