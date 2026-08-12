import { fileURLToPath } from 'node:url';

import { startStaticServer } from './static-server.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number.parseInt(process.env.PORT ?? '8000', 10);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error('PORT must be an integer between 0 and 65535.');
  process.exit(1);
}

const server = await startStaticServer(root, port);
const address = server.address();
console.log(`Presentation available at http://127.0.0.1:${address.port}`);
