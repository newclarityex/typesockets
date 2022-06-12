import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

export function createServer(...args: any[]) {
    return new WebSocketServer(...args);
}

export function createServerEndpoints
    <T extends Record<string, (...args: any[]) => void>>(endpoints: T)
    : {
        hydrate: (hydratedEndpoints: {
            [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void
        }) => {
            hydratedEndpoints: {
                [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void
            },
            attachServer: (server: WebSocketServer) => void,
        },
        extracted: { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void }
    } {
    return {
        hydrate: (hydratedEndpoints: { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void }) => {
            return {
                hydratedEndpoints: Object.fromEntries(
                    Object.keys(endpoints).map(
                        (key) => [key, (ws: WebSocket, ...args) => hydratedEndpoints[key](ws, ...args)]
                    )
                ),
                attachServer: (server: WebSocketServer) => {
                    server.on("connection", (ws) => {
                        ws.on("message", (message) => {
                            const { type, payload } = JSON.parse(message.toString());
                            if (type in hydratedEndpoints) {
                                hydratedEndpoints[type](ws, ...payload);
                            }
                        });
                    });
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
        hydrate: (hydratedEndpoints: {
            [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void
        }) => {
            hydratedEndpoints: {
                [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void
            },
            attachServer: (server: WebSocketServer) => void,
        },
        extracted: { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void }
    };
}