/**
 * ApiCall - Make HTTP requests to external APIs
 */

const http = require('http');
const https = require('https');

class ApiCall {
  constructor(config) {
    this.api_call_id = config.api_call_id;
    this.url = config.url || '';
    this.method = config.method || 'GET';
    this.headers = config.headers || {};
    this.body = config.body || null;
    this.timeout = config.timeout || 30000;
    this._response = null;
    this._error = null;
  }

  /**
   * Execute the API call
   */
  call() {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(this.url);
      const lib = urlObj.protocol === 'https:' ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: this.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        timeout: this.timeout
      };

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            this._response = parsed;
            resolve(parsed);
          } catch {
            this._response = data;
            resolve(data);
          }
        });
      });

      req.on('error', (err) => {
        this._error = err;
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (this.body && (this.method === 'POST' || this.method === 'PUT' || this.method === 'PATCH')) {
        req.write(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
      }

      req.end();
    });
  }

  get_response() { return this._response; }
  get_error() { return this._error; }
}

module.exports = ApiCall;