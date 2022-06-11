export default function createClientEndpoints<T extends Record<string, (...args: any[]) => any>>(ws: WebSocket, endpoints: T): { endpoints: T; extractEndpoints(): { [K in keyof T]: (ws: WebSocket, ...args: Parameters<T[K]>) => void } } {
    ws.onmessage = (message) => {
        const { type, payload } = JSON.parse(message.data.toString());
        if (type in endpoints) {
            endpoints[type](...payload);
        }
    };
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