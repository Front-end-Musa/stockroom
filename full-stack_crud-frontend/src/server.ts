import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const apiOrigin = process.env['API_ORIGIN'];

if (apiOrigin) {
  app.use('/api', async (request, response, next) => {
    try {
      const targetUrl = new URL(request.originalUrl, apiOrigin);
      const requestBody = await readRequestBody(request);
      const apiResponse = await fetch(targetUrl, {
        method: request.method,
        headers: getForwardHeaders(request.headers),
        body: requestBody.length > 0 ? new Uint8Array(requestBody) : undefined,
      });

      response.status(apiResponse.status);
      apiResponse.headers.forEach((value, name) => response.setHeader(name, value));
      response.send(Buffer.from(await apiResponse.arrayBuffer()));
    } catch (error) {
      next(error);
    }
  });
} else {
  app.use('/api', (_request, response) => {
    response.status(503).json({
      title: 'Product API proxy is not configured.',
      detail: 'Set the API_ORIGIN environment variable for the SSR server.',
    });
  });
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

function readRequestBody(request: express.Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function getForwardHeaders(headers: express.Request['headers']): Headers {
  const forwardedHeaders = new Headers();
  const excludedHeaders = new Set(['connection', 'content-length', 'host']);

  for (const [name, value] of Object.entries(headers)) {
    if (value && !excludedHeaders.has(name.toLowerCase())) {
      forwardedHeaders.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  return forwardedHeaders;
}
