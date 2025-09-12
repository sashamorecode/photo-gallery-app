import fs from 'fs';
import https from 'https';
import { handler } from './build/handler.js';
const cert = fs.readFileSync('/etc/letsencrypt/live/jonasschledorn.com/fullchain.pem');
const key = fs.readFileSync('/etc/letsencrypt/live/jonasschledorn.com/privkey.pem');

https.createServer({ key, cert }, handler)
  .listen(3000, () => {
    console.log('HTTPS server running on port 443');
  });

