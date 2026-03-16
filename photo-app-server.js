import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { handler } from './build/handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.resolve(process.env.UPLOADS_DIR ?? path.join(__dirname, 'static', 'uploads'));

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

function getUploadFilePath(urlPathname) {
  const relativePath = decodeURIComponent(urlPathname.replace(/^\/uploads\//, ''));
  const absolutePath = path.resolve(uploadsRoot, relativePath);

  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return null;
  }

  return absolutePath;
}

function serveUpload(req, res) {
  const url = new URL(req.url ?? '/', 'https://localhost');

  if (!url.pathname.startsWith('/uploads/')) {
    return false;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return true;
  }

  const filePath = getUploadFilePath(url.pathname);
  if (!filePath) {
    res.statusCode = 403;
    res.end('Forbidden');
    return true;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.statusCode = 404;
    res.end('Not Found');
    return true;
  }

  const contentType = MIME_BY_EXT[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'HEAD') {
    res.statusCode = 200;
    res.end();
    return true;
  }

  fs.createReadStream(filePath).pipe(res);
  return true;
}

const cert = fs.readFileSync('/etc/letsencrypt/live/jonasschledorn.com/fullchain.pem');
const key = fs.readFileSync('/etc/letsencrypt/live/jonasschledorn.com/privkey.pem');

https.createServer({ key, cert }, (req, res) => {
  if (serveUpload(req, res)) {
    return;
  }

  handler(req, res);
})
  .listen(3000, () => {
    console.log('HTTPS server running on port 443');
  });

