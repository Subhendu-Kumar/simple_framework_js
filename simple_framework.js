import { createServer } from "http";
import { parse } from "url";
import { parse as _parse } from "querystring";
import { createPool } from "mysql2/promise";

class SimpleFramework {
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
    };
    this.dbConfig = null;
    this.dbPool = null;
  }

  // Configure database connection
  database(config) {
    this.dbConfig = config;
    this.dbPool = createPool({
      host: config.host || "localhost",
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  // Execute SQL queries
  async query(sql, params = []) {
    if (!this.dbPool) {
      throw new Error("Database not configured. Use app.database() first.");
    }
    try {
      const [rows] = await this.dbPool.execute(sql, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // GET route handler
  get(path, handler) {
    this.routes.GET[path] = handler;
  }

  // POST route handler
  post(path, handler) {
    this.routes.POST[path] = handler;
  }

  // Parse request body for POST requests
  parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          // Try to parse as JSON first
          if (req.headers["content-type"] === "application/json") {
            resolve(JSON.parse(body));
          } else {
            // Parse as form data
            resolve(_parse(body));
          }
        } catch (error) {
          resolve(body);
        }
      });
      req.on("error", reject);
    });
  }

  // Create request and response objects with helper methods
  createReqRes(req, res) {
    const parsedUrl = parse(req.url, true);

    // Enhanced request object
    const request = {
      ...req,
      path: parsedUrl.pathname,
      query: parsedUrl.query,
      params: {},
      body: null,
    };

    // Enhanced response object
    const response = {
      ...res,
      json: (data) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      },
      send: (data) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(data.toString());
      },
      status: (code) => {
        res.statusCode = code;
        return response;
      },
    };

    return { request, response };
  }

  // Route matching with parameters
  matchRoute(method, path) {
    const routes = this.routes[method];

    // Exact match first
    if (routes[path]) {
      return { handler: routes[path], params: {} };
    }

    // Parameter matching
    for (const routePath in routes) {
      const params = {};
      const routeParts = routePath.split("/");
      const pathParts = path.split("/");

      if (routeParts.length !== pathParts.length) continue;

      let match = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
          // Parameter route
          const paramName = routeParts[i].substring(1);
          params[paramName] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        return { handler: routes[routePath], params };
      }
    }

    return null;
  }

  // Start the server
  listen(port, callback) {
    const server = createServer(async (req, res) => {
      try {
        const { request, response } = this.createReqRes(req, res);
        const method = req.method;
        const path = request.path;

        // Find matching route
        const routeMatch = this.matchRoute(method, path);

        if (!routeMatch) {
          response.status(404).send("Route not found");
          return;
        }

        // Add params to request
        request.params = routeMatch.params;

        // Parse body for POST requests
        if (method === "POST") {
          request.body = await this.parseBody(req);
        }

        // Add database query method to request
        request.query = async (sql, params) => {
          return await this.query(sql, params);
        };

        // Execute route handler
        await routeMatch.handler(request, response);
      } catch (error) {
        console.error("Server error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });

    server.listen(port, callback);
    return server;
  }

  // Close database connections
  async close() {
    if (this.dbPool) {
      await this.dbPool.end();
    }
  }
}

// Export the framework
export default SimpleFramework;
