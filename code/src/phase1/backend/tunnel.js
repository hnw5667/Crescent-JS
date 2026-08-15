/**
 * Tunnel.js - EncryptedTunnel: encrypted+compressed tunnels for outbound data
 *
 * Automatically wraps outgoing data into a self-contained packet via cipher.prepare().
 */

const http = require('http');
const crypto = require('crypto');
const cipher = require('../cipher');

class EncryptedTunnel {
  constructor(config = {}) {
    this.secret = config.secret || 'crescent-default-secret';
    this.tunnel_id = config.tunnel_id || 'tunnel-' + Date.now();
    this.port = config.port || null;
    this.host = config.host || null;
    this.server = null;
    this.closed = false;

    // Optional HTTP passthrough listener when a port is configured
    if (this.port) {
      this.server = http.createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          const out = this.receive(body);
          const payload = typeof out === 'string' ? out : JSON.stringify(out);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(payload);
        });
      });
      this.server.listen(this.port, this.host || undefined);
    }
  }

  /**
   * Send data through the tunnel -> returns a self-contained encrypted packet
   */
  send(data, options = {}) {
    const secret = options.secret || this.secret;
    return cipher.prepare(data, secret);
  }

  /**
   * Receive a raw packet and return the original data (JSON parsed if JSON)
   */
  receive(packet, options = {}) {
    const secret = options.secret || this.secret;
    try {
      return cipher.unwrap(packet, secret);
    } catch (err) {
      // Graceful fallback: return the raw string if it cannot be decoded
      return typeof packet === 'string' ? packet : String(packet);
    }
  }

  /**
   * Build a capability object proving the tunnel is established
   */
  handshake(remote = '', secret = this.secret) {
    const secret_id = crypto
      .createHash('sha256')
      .update(secret + '|' + this.tunnel_id + '|' + remote)
      .digest('hex')
      .slice(0, 24);
    return {
      tunnel_id: this.tunnel_id,
      secret_id,
      status: this.closed ? 'closed' : 'open'
    };
  }

  /**
   * Alias of send
   */
  sendAsTunnel(data, options = {}) {
    return this.send(data, options);
  }

  /**
   * Mark the tunnel closed and stop the passthrough listener
   */
  close() {
    this.closed = true;
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  /**
   * Whether the tunnel is currently open
   */
  is_open() {
    return !this.closed;
  }
}

/**
 * Factory: create a ready-to-use EncryptedTunnel instance
 */
function createTunnel(config) {
  return new EncryptedTunnel(config);
}

module.exports = { EncryptedTunnel, createTunnel };