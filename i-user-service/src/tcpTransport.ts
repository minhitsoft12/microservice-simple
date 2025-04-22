import * as net from 'net';
import { EventEmitter } from 'events';

export interface Message {
    pattern: string;
    data: any;
    id?: string;
}

export type MessageResponse = {
    id: string;
    response: any;
}

export class TCPTransport extends EventEmitter {
    private server: net.Server | null = null;
    private clients: Map<string, net.Socket> = new Map();
    private connections: Map<string, net.Socket> = new Map();
    private port: number;
    private host: string;

    constructor(port: number, host: string = '127.0.0.1') {
        super();
        this.port = port;
        this.host = host;
    }

    /**
     * Start the TCP server to listen for connections
     */
    public startServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = net.createServer((socket) => {
                const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
                console.log(`New client connected: ${clientId}`);

                this.clients.set(clientId, socket);

                let buffer = '';

                socket.on('data', (data) => {
                    buffer += data.toString();

                    // Process the buffer while there’s data to parse
                    while (buffer.length > 0) {
                        // Find the '#' separator
                        const hashIndex = buffer.indexOf('#');
                        if (hashIndex === -1) {
                            // Incomplete length prefix, wait for more data
                            break;
                        }

                        // Extract the length prefix (e.g., "117")
                        const lengthStr = buffer.substring(0, hashIndex);
                        const messageLength = parseInt(lengthStr, 10);

                        if (isNaN(messageLength)) {
                            console.error('Invalid length prefix:', lengthStr);
                            buffer = ''; // Clear buffer to avoid infinite loop
                            break;
                        }

                        // Check if the full message is available
                        const messageStart = hashIndex + 1;
                        const messageEnd = messageStart + messageLength;
                        if (buffer.length < messageEnd) {
                            // Incomplete message, wait for more data
                            break;
                        }

                        // Extract and parse the message
                        const messageStr = buffer.substring(messageStart, messageEnd);
                        try {
                            const parsedMsg = JSON.parse(messageStr) as Message;
                            console.log('Parsed message:', parsedMsg, 'from client:', clientId);
                            this.emit('message', parsedMsg, clientId);
                        } catch (err) {
                            console.error('Failed to parse message:', err);
                        }

                        // Remove the processed message from the buffer
                        buffer = buffer.substring(messageEnd);
                    }
                });

                socket.on('end', () => {
                    console.log(`Client disconnected: ${clientId}`);
                    this.clients.delete(clientId);
                    this.emit('clientDisconnected', clientId);
                });

                socket.on('error', (err) => {
                    console.error(`Socket error for client ${clientId}:`, err);
                    this.clients.delete(clientId);
                    this.emit('error', err, clientId);
                });
            });

            this.server.on('error', (err) => {
                console.error('Server error:', err);
                reject(err);
            });

            this.server.listen(this.port, this.host, () => {
                console.log(`TCP Transport server started on ${this.host}:${this.port}`);
                resolve();
            });
        });
    }

    /**
     * Connect to another service
     */
    public connect(serviceHost: string, servicePort: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const connectionId = `${serviceHost}:${servicePort}`;

            if (this.connections.has(connectionId)) {
                resolve(connectionId);
                return;
            }

            const socket = new net.Socket();

            socket.connect(servicePort, serviceHost, () => {
                console.log(`Connected to service at ${connectionId}`);
                this.connections.set(connectionId, socket);
                resolve(connectionId);
            });

            let buffer = '';

            socket.on('data', (data) => {
                buffer += data.toString();

                const messages = buffer.split('\n');
                buffer = messages.pop() || '';

                for (const msg of messages) {
                    if (msg.trim()) {
                        try {
                            const parsedMsg = JSON.parse(msg) as Message;
                            this.emit('message', parsedMsg, connectionId);
                        } catch (err) {
                            console.error('Failed to parse message:', err);
                        }
                    }
                }
            });

            socket.on('close', () => {
                console.log(`Connection closed: ${connectionId}`);
                this.connections.delete(connectionId);
                this.emit('connectionClosed', connectionId);
            });

            socket.on('error', (err) => {
                console.error(`Connection error for ${connectionId}:`, err);
                reject(err);
            });
        });
    }

    /**
     * Send a message to a specific client or connection
     */
    public sendToTarget(targetId: string, message: MessageResponse): boolean {
        const socket = this.clients.get(targetId) || this.connections.get(targetId);

        if (!socket) {
            console.error(`Target not found: ${targetId}`);
            return false;
        }

        try {
            const messageStr = JSON.stringify(message);
            const messageLength = messageStr.length;
            const prefixedMessage = `${messageLength}#${messageStr}`;

            console.log(`Sending to target ${messageStr}`);
            socket.write(prefixedMessage);
            return true;
        } catch (err) {
            console.error(`Failed to send message to ${targetId}:`, err);
            return false;
        }
    }

    /**
     * Broadcast a message to all connected clients
     */
    public broadcast(message: Message): void {
        const serializedMessage = JSON.stringify(message) + '\n';

        for (const [clientId, socket] of this.clients.entries()) {
            try {
                socket.write(serializedMessage);
            } catch (err) {
                console.error(`Failed to broadcast to ${clientId}:`, err);
            }
        }
    }

    /**
     * Stop the TCP server and close all connections
     */
    public shutdown(): Promise<void> {
        return new Promise((resolve) => {
            // Close all client connections
            for (const socket of this.clients.values()) {
                socket.end();
            }

            // Close all outgoing connections
            for (const socket of this.connections.values()) {
                socket.end();
            }

            if (this.server) {
                this.server.close(() => {
                    console.log('TCP Transport server shut down');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}