import { WebSocketServer } from "ws";

export default function createServer(...args: any[]) {
    return new WebSocketServer(...args);
}