import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { handler } from './build/handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRootCandidates = Array.from(new Set([
  process.env.UPLOADS_DIR,
  path.join(__dirname, 'static', 'uploads'),
  path.join(process.cwd(), 'static', 'uploads')
].filter(Boolean).map((p) => path.resolve(p))));

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
  for (const root of uploadRootCandidates) {
    const absolutePath = path.resolve(root, relativePath);
    if (!absolutePath.startsWith(`${root}${path.sep}`)) {
      continue;
    }

    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
      return absolutePath;
    }
  }

  return null;
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
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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

