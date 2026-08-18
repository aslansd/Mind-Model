/**
 * Production server for Mind Model.
 *
 * The project previously had no server and no `start` script at all: `npm start`
 * failed with "Missing script", and `vite preview` binds 4173 on localhost and
 * ignores $PORT. A Cloud Run container must listen on the injected PORT on
 * 0.0.0.0, so a source deploy of this repo had nothing valid to run.
 *
 * Mind Model is a pure client-side simulation — no Gemini calls, no API routes —
 * so this only needs to serve ./dist with an SPA fallback.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Cloud Run injects PORT (8080 by default) and health-checks it. Never hardcode.
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const distPath = path.join(process.cwd(), 'dist');

if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.error(
    `No build found at ${distPath}. Run "npm run build" before "npm start".`
  );
  process.exit(1);
}

// Liveness probe.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Hashed asset filenames are immutable; index.html must never be cached or
// clients keep booting the previous deployment's JavaScript.
app.use(
  express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// SPA fallback for any non-asset route.
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Mind Model listening on http://${HOST}:${PORT}`);
});

// Cloud Run sends SIGTERM before reclaiming an instance.
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down.');
  server.close(() => process.exit(0));
});
