import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'fs';
import path from 'path';

function sketchupSyncPlugin() {
  return {
    name: 'sketchup-sync-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sketchup-sync', (req, res, next) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        const syncFilePath = path.resolve(process.cwd(), 'public', 'sketchup_latest_sync.json');

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.writeFileSync(syncFilePath, JSON.stringify(data, null, 2), 'utf-8');
              console.log(`[SketchUp Sync] Recibidos ${data.collisionBlocks ? data.collisionBlocks.length : 0} bloques de colisión desde Trimble SketchUp.`);
              
              // Notificar clientes Vite via HMR si están conectados
              server.ws.send({
                type: 'custom',
                event: 'sketchup-sync-event',
                data: data
              });

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'ok', message: 'Sincronización bidireccional exitosa' }));
            } catch (err) {
              console.error('[SketchUp Sync Error]', err);
              res.statusCode = 400;
              res.end(JSON.stringify({ status: 'error', error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'GET') {
          if (fs.existsSync(syncFilePath)) {
            const data = fs.readFileSync(syncFilePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(data);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 404;
            res.end(JSON.stringify({ status: 'not_found' }));
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), sketchupSyncPlugin()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3040
  }
});
