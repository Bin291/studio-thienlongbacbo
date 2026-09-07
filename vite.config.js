import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function saveScreenshotsPlugin() {
  return {
    name: 'save-screenshots-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-screenshots', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const screenshotsDir = path.resolve(__dirname, 'screenshots');
            if (!fs.existsSync(screenshotsDir)) {
              fs.mkdirSync(screenshotsDir, { recursive: true });
            }

            // Tìm folder dạng số tiếp theo: 1, 2, 3...
            const existing = fs.readdirSync(screenshotsDir)
              .filter((f) => {
                const p = path.join(screenshotsDir, f);
                return fs.statSync(p).isDirectory() && /^\d+$/.test(f);
              })
              .map(Number);

            const nextIndex = existing.length > 0 ? Math.max(...existing) + 1 : 1;
            const targetFolder = path.join(screenshotsDir, String(nextIndex));
            fs.mkdirSync(targetFolder, { recursive: true });

            // Ghi từng ảnh PNG
            for (const img of data.images) {
              const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              fs.writeFileSync(path.join(targetFolder, img.name), buffer);
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              folder: String(nextIndex),
              relPath: `screenshots/${nextIndex}`,
              fullPath: targetFolder,
              count: data.images.length,
            }));
          } catch (err) {
            console.error('Error saving screenshots:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [saveScreenshotsPlugin()],
  server: {
    port: 5174,
    open: true,
  },
});
