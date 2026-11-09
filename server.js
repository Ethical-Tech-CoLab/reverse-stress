'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const publicNames = new Set(['index.html', 'styles.css', 'icon.svg', 'app.js', 'data.js', 'public-sources.js']);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function createServer() {
  return http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end('Invalid URL');
      return;
    }
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!publicNames.has(name)) {
      res.writeHead(404).end('Not found');
      return;
    }
    const filename = path.join(__dirname, name);
    fs.stat(filename, (error, stat) => {
      if (error || !stat.isFile()) {
        console.error('Cannot serve requested research asset:', error?.message || 'Not a file');
        res.writeHead(404).end('Research asset is unavailable');
        return;
      }
      res.writeHead(200, {
        'Content-Type': mime[path.extname(filename)] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const stream = fs.createReadStream(filename);
      stream.on('error', error => {
        console.error('Research asset stream failed:', error.message);
        res.destroy(error);
      });
      stream.pipe(res);
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  const server = createServer();
  server.on('error', error => {
    console.error(`Resilience Atlas could not start: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Resilience Atlas ready at http://127.0.0.1:${port}`);
    console.log('Public teaching edition, served on loopback. Private originals and full-text extracts are not served.');
  });
}

module.exports = { createServer, publicNames };
