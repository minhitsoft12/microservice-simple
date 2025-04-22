import {Message, TCPTransport} from '../tcpTransport';

type MessageResponse = {
    id: string;
    response: any;
}

// Custom request class to simulate Express.Request for TCP messages
export class TCPRequest {
    body: any;
    params: any;
    query: any;
    headers: Record<string, string>;
    user?: any;

    constructor(message: Message, senderId: string, params: Record<string, string> = {}) {
        console.log()
        const {user = {}, ...body} = message.data;
        this.body = body || {};
        this.params = params;
        this.query = {};
        this.user = user;
        this.headers = {
            'x-sender-id': senderId,
            'x-request-id': message.id || '',
            'x-message-type': message.pattern
        };
    }
}

// Custom response class to simulate Express.Response for TCP messages
export class TCPResponse {
    private statusCode: number = 200;
    private responseData: any = null;
    private transport: TCPTransport;
    private targetId: string;
    private message: MessageResponse;

    constructor(transport: TCPTransport, targetId: string, message: MessageResponse) {
        this.transport = transport;
        this.targetId = targetId;
        this.message = message;
    }

    status(code: number): TCPResponse {
        this.statusCode = code;
        return this;
    }

    json(data: any): void {
        this.responseData = data;
        this.send();
    }

    send(data?: any): void {
        const responseData = data || this.responseData;

        this.transport.sendToTarget(this.targetId, {
            id: this.message.id,
            response: {
                status: this.statusCode,
                data: responseData,
            }
        });
    }
}

// Handler type definition that works with both Express and our TCP simulation
export type RouteHandler = (req: TCPRequest, res: TCPResponse) => Promise<void>;

// Interface for route patterns with parameter definitions
interface RoutePattern {
    pattern: string;          // Original pattern e.g. "USER.UPDATE_PROFILE.:id"
    regex: RegExp;            // Compiled regex to match against incoming messages
    paramNames: string[];     // Array of parameter names in the order they appear
    handler: RouteHandler;    // The route handler function
}

export class TCPRouteMapper {
    private readonly transport: TCPTransport;
    private routes: RoutePattern[] = [];

    constructor(transport: TCPTransport) {
        this.transport = transport;

        // Initialize the message listener
        this.initializeListener();
    }

    private initializeListener(): void {
        console.log(`Received ${JSON.stringify(this.transport)}`);
        this.transport.on('message', async (message: Message, senderId: string) => {
            await this.handleMessage(message, senderId);
        });
    }

    /**
     * Register a route handler for a specific message type pattern
     * Now supports parameter placeholders using ':paramName' syntax
     * Example: "USER.UPDATE_PROFILE.:id"
     */
    public registerRoute(messageTypePattern: string, handler: RouteHandler): void {
        const pattern = this.parseRoutePattern(messageTypePattern, handler);
        this.routes.push(pattern);

        console.log(`Registered TCP route handler for: ${messageTypePattern} -> ${pattern.regex}`);
    }

    /**
     * Parse a route pattern string into a RoutePattern object
     */
    private parseRoutePattern(pattern: string, handler: RouteHandler): RoutePattern {
        const paramNames: string[] = [];

        // Find parameter placeholders and replace with regex capture groups
        const regexPattern = pattern
          .split('.')
          .map(part => {
              if (part.startsWith(':')) {
                  // This is a parameter
                  const paramName = part.substring(1);
                  paramNames.push(paramName);
                  return '([^.]+)'; // Match anything except dots
              } else if (part === '*') {
                  // Wildcard segment
                  return '[^.]+';
              } else {
                  // Regular text - escape for regex
                  return part.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              }
          })
          .join('\\.');

        // Create the final regex with ^ and $ to ensure full match
        const regex = new RegExp(`^${regexPattern}$`);

        return {
            pattern,
            regex,
            paramNames,
            handler
        };
    }

    /**
     * Handle incoming TCP messages by routing to appropriate handler
     */
    private async handleMessage(message: Message, senderId: string): Promise<void> {
        console.log(`Routing TCP message: ${message.pattern} from ${senderId}`);
        console.log(message);

        // Find matching route handler
        const match = this.findMatchingHandler(message.pattern);

        if (!match) {
            console.error(`No handler registered for message type: ${message.pattern}`);
            this.transport.sendToTarget(senderId, {
                id: message.id ?? "",
                response: {
                    status: 404,
                    error: 'Not Found',
                    message: `No handler for message type: ${message.pattern}`
                }
            });
            return;
        }

        try {
            // Extract parameters from the route pattern
            const {handler, params} = match;

            // Create request and response objects
            const req = new TCPRequest(message, senderId, params);
            const res = new TCPResponse(this.transport, senderId, {
                id: message.id ?? "",
                response: message.data
            });

            // Execute the handler
            await handler(req, res);
        } catch (error) {
            console.error(`Error handling message ${message.pattern}:`, error);
            this.transport.sendToTarget(senderId, {
                id: message.id ?? "",
                response: {
                    status: 500,
                    error: 'Internal Server Error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                }
            });
        }
    }

    /**
     * Find a handler that matches the message type and extract parameters
     * Returns the handler and extracted parameters if found
     */
    private findMatchingHandler(messageType: string): { handler: RouteHandler, params: Record<string, string> } | undefined {
        for (const route of this.routes) {
            const match = messageType.match(route.regex);

            if (match) {
                // Extract parameter values from regex match groups
                const params: Record<string, string> = {};

                // Start from index 1 to skip the full match at index 0
                for (let i = 0; i < route.paramNames.length; i++) {
                    // Add each parameter to the params object
                    params[route.paramNames[i]] = match[i + 1];
                }

                return {
                    handler: route.handler,
                    params
                };
            }
        }

        return undefined;
    }
}