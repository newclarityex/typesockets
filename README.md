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
The following documentation will follow the ES6 syntax.

## Creating the Server
Create the server by using the very thin wrapper function `createServer`.
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
Server endpoints are functions that run on the server and are called from the client. To create these endpoints, run the `createServerEndpoints` function with the websocket server and a dictionary of functions as parameters. These endpoints can then be exported to be used client side. Then hydrate the functions with their actual functionality and attach it to the server.

### serverEndpoints.ts
Creating the endpoints
```TS
import { createServerEndpoints } from "typesockets";

export const serverEndpoints = createServerEndpoints( {
    log: (msg: string) => { }
});
```

### server.ts
Hydrating and attaching the endpoints
```TS
import { serverEndpoints } from "../path/to/serverEndpoints.ts";

// Hydrating the functions
const hydrated = serverEndpoints.hydrate({
    log: (ws: Websocket, msg: string) => {
        console.log(string);
    }
});

// Create server
const server = createServer({ port: 8081 });

// Attach the newly hydrated functions to run on server
hydrated.attachServer(server);
```

### client.ts
```TS
import serverEndpoints from "../path/to/serverEndpoints.ts";

// Use the converted functions from the server endpoints
const extractedEndpoints = serverEndpoints.extracted;

// Create client
const socket = new Websocket("ws://server-ws.url");

// Sends websocket request to server to run command 'log' with parameter "Hello World" as msg
extractedEndpoints.log(socket, "Hello World!");
```

## Client Endpoints
Client endpoints are similar to server endpoints, but instead call client functions from the server and do not require hydration, but still need to be attached.

### clientEndpoints.ts
```TS
// Create the functions directly
export const clientEndpoints = createClientEndpoints({
    log: (msg: string) => {
        console.log(msg);
    }
});
```

### client.ts
```TS
import clientEndpoints from "../path/to/clientEndpoints.ts";

// Create client
const socket = new Websocket("ws://server-ws.url");

// Attach client to endpoints
clientEndpoints.attachClient(socket);
```

### server.ts
```TS
import clientEndpoints from "../path/to/clientEndpoints.ts";

// Create server
const server = createServer({ port: 8081 });

// Use the converted functions from the client endpoints
const extractedEndpoints = clientEndpoints.extracted;

// If we wanted to broadcast the log function to all clients
server.clients.forEach((client) => {
    // Sends websocket request to run log on every connected client
    extractedEndpoints.log(client, "Hello World");
});
```

## Example
TODO
