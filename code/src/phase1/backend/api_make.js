/**
 * ApiMake - Create REST API endpoints
 */

const http = require('http');
const { prepare, unwrap } = require('../cipher');

class ApiMake {
  constructor(config) {
    this.api_id = config.api_id;
    this.port = config.port || 3000;
    this.host = config.host || 'localhost';
    this.endpoints = config.endpoints || [];
    this.cors = config.cors !== undefined ? config.cors : true;
    this.secret = config.secret || 'crescent-default-secret';
    this._server = null;
    this._middleware = [];
  }

  add_endpoint(method, path, handler) {
    this.endpoints.push({ method: method.toUpperCase(), path, handler });
    return this;
  }

  use(middleware) {
    this._middleware.push(middleware);
    return this;
  }

  start() {
    return new Promise((resolve, reject) => {
      this._server = http.createServer((req, res) => {
        // CORS - configurable, avoid wildcard with credentials
        if (this.cors) {
          const origin = req.headers.origin;
          const allowOrigin = (typeof this.cors === 'object' && this.cors.origin) ? this.cors.origin : (origin || '*');
          res.setHeader('Access-Control-Allow-Origin', allowOrigin);
          res.setHeader('Vary', 'Origin');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          if (typeof this.cors === 'object' && this.cors.credentials) res.setHeader('Access-Control-Allow-Credentials', 'true');
          if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
          }
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if (!body || body.length === 0) {
            req.body = {};
          } else {
            try {
              req.body = unwrap(body, this.secret);
            } catch {
              try {
                req.body = JSON.parse(body);
              } catch {
                // Fallback: raw string if not JSON
                req.body = body;
              }
            }
          }

          // Run middleware chain
          let idx = 0;
          const next = () => {
            if (idx < this._middleware.length) {
              this._middleware[idx++](req, res, next);
            } else {
              this._route(req, res);
            }
          };
          next();
        });
      });

      this._server.listen(this.port, this.host, () => {
        resolve({ port: this.port, host: this.host });
      });

      this._server.on('error', reject);
    });
  }

  _route(req, res) {
    const method = req.method.toUpperCase();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams);

    const endpoint = this.endpoints.find(
      e => e.method === method && this._matchPath(e.path, path)
    );

    if (endpoint) {
      // Extract path parameters
      req.params = this._extractParams(endpoint.path, path);
      req.query = params;

      try {
        endpoint.handler(req, res);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/octet-stream' });
        res.end(prepare({ error: 'Internal Server Error' }, this.secret));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/octet-stream' });
      res.end(prepare({ error: 'Not Found' }, this.secret));
    }
  }

  _matchPath(routePath, actualPath) {
    const norm = (p) => p.replace(/\/+$/, '') || '/';
    routePath = norm(routePath);
    actualPath = norm(actualPath);
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    if (routeParts.length !== actualParts.length) return false;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue;
      if (routeParts[i] !== actualParts[i]) return false;
    }
    return true;
  }

  _extractParams(routePath, actualPath) {
    const norm = (p) => p.replace(/\/+$/, '') || '/';
    routePath = norm(routePath);
    actualPath = norm(actualPath);
    const params = {};
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        try {
          params[routeParts[i].slice(1)] = decodeURIComponent(actualParts[i]);
        } catch {
          params[routeParts[i].slice(1)] = actualParts[i];
        }
      }
    }
    return params;
  }

  stop() {
    return new Promise((resolve) => {
      if (this._server) {
        this._server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}

module.exports = ApiMake;