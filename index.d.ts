// index.d.ts
declare module "simple_framework_js" {
  import { IncomingMessage, ServerResponse, Server } from "http";
  import { ParsedUrlQuery } from "querystring";
  import { Pool, PoolOptions } from "mysql2/promise";

  export interface DatabaseConfig {
    host?: string;
    user: string;
    password: string;
    database: string;
    [key: string]: any;
  }

  export interface RouteParams {
    [key: string]: string;
  }

  export interface Request extends IncomingMessage {
    path: string;
    query: ParsedUrlQuery;
    params: RouteParams;
    body: any;
    query(sql: string, params?: any[]): Promise<any>;
  }

  export interface Response extends ServerResponse {
    json(data: any): void;
    send(data: string | number): void;
    status(code: number): Response;
  }

  export type RouteHandler = (
    req: Request,
    res: Response
  ) => void | Promise<void>;

  export interface RouteMatch {
    handler: RouteHandler;
    params: RouteParams;
  }

  export interface Routes {
    GET: { [path: string]: RouteHandler };
    POST: { [path: string]: RouteHandler };
  }

  export class SimpleFramework {
    routes: Routes;
    dbConfig: DatabaseConfig | null;
    dbPool: Pool | null;

    constructor();

    /**
     * Configure database connection
     * @param config Database configuration object
     */
    database(config: DatabaseConfig): void;

    /**
     * Execute SQL queries
     * @param sql SQL query string
     * @param params Query parameters
     * @returns Promise resolving to query results
     */
    query(sql: string, params?: any[]): Promise<any>;

    /**
     * Register GET route handler
     * @param path Route path (supports parameters like /users/:id)
     * @param handler Route handler function
     */
    get(path: string, handler: RouteHandler): void;

    /**
     * Register POST route handler
     * @param path Route path (supports parameters like /users/:id)
     * @param handler Route handler function
     */
    post(path: string, handler: RouteHandler): void;

    /**
     * Parse request body for POST requests
     * @param req Incoming request
     * @returns Promise resolving to parsed body
     */
    parseBody(req: IncomingMessage): Promise<any>;

    /**
     * Create enhanced request and response objects
     * @param req Incoming request
     * @param res Server response
     * @returns Enhanced request and response objects
     */
    createReqRes(
      req: IncomingMessage,
      res: ServerResponse
    ): {
      request: Request;
      response: Response;
    };

    /**
     * Match route with parameters
     * @param method HTTP method
     * @param path Request path
     * @returns Route match object or null
     */
    matchRoute(method: string, path: string): RouteMatch | null;

    /**
     * Start the HTTP server
     * @param port Port number to listen on
     * @param callback Optional callback function
     * @returns HTTP Server instance
     */
    listen(port: number, callback?: () => void): Server;

    /**
     * Close database connections
     */
    close(): Promise<void>;
  }

  export default SimpleFramework;
}
