#  TypeSockets
An end-to-end typesafe websockets wrapper/addon through the creation of client and server endpoint functions.

## Installing
Install this module with `yarn add typesockets` or `npm i typesockets`.

## Importing
### Node
```TS
const { createServer, createServerEndpoints, creatingClientEndpoints } = require("typesockets");
```
### ES6
```TS
import { createServer, createServerEndpoints, creatingClientEndpoints } from "typesockets";
```

## Creating the Server
Create the server by using the wrapper function `createServer`.
<br/>
It uses the same options as the node `ws` module, and returns a WebsocketServer as it is just a wrapper.
<br/>
https://github.com/websockets/ws/blob/HEAD/doc/ws.md#class-websocketserver
### server.ts
```TS
const server = createServer({ port: 8081 });
```

## Creating the Client
Create the client by using the W3C standard for websockets:
<br/>
https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket
<br/>
### client.ts
```TS
const socket = new Websocket("ws://server-ws.url");
```

## Server Endpoints
Server endpoints are functions that run on the server and are called from the client. To attach these endpoints, run the `createServerEndpoints` function with the websocket server and a dictionary of functions as parameters. These endpoints can then be exported to be used client side.
### server.ts
```TS
// Assuming server is created as shown above
export const serverEndpoints = createServerEndpoints(server, {
    log: (ws: WebSocket, msg: string) => {
        console.log(msg);
    }
});
```
### client.ts
```TS
// Assuming client is created as shown above
// Import the generated function from the server
import { log } from "../path/to/server.ts";

// Will send websocket request to server to run command 'log' with parameter "Hello World" as msg
log(socket, "Hello World!");
```
## Client Endpoints
Client endpoints are similar to server endpoints, but instead call client functions from the server and do not require a WebSocket object as a parameter for the functions, but do require the server side WebSocket object to choose which client to send to.
### client.ts
```TS
// Assuming client is created as shown above
export const clientEndpoints = createClientEndpoints(socket, {
    log: (msg: string) => {
        console.log(msg);
    }
});
```
### server.ts
```TS
// Assuming server is created as shown above
// Import the generated function from the client
import { log } from "../path/to/client.ts";

// If we wanted to broadcast the log function to all clients
server.clients.forEach((client) => {
    // Sends websocket request to run log on every connected client
    log(client, "Hello World");
});
```

## Example
TODO
