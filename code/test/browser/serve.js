#!/usr/bin/env node
/**
 * Static server for the in-browser test. Serves the test folder.
 * Usage: node serve.js [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const port = Number(process.argv[2] || process.env.PORT || 8124);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, ''));
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found: ' + urlPath); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => console.log('[serve] http://127.0.0.1:' + port + '/'));
