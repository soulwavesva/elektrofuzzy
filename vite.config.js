import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

// Custom plugin to serve the /@frame/ folder from the filesystem
function serveFrameFolder() {
  return {
    name: 'serve-frame-folder',
    configureServer(server) {
      server.middlewares.use('/@frame', (req, res, next) => {
        // req.url contains the path part after /@frame
        const filePath = path.join('/Users/fantannasy/Downloads/frame', req.url);
        if (fs.existsSync(filePath)) {
          const contents = fs.readFileSync(filePath);
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Cache-Control', 'max-age=3600');
          res.end(contents);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [serveFrameFolder()],
  server: {
    fs: {
      allow: [
        '.',
        '/Users/fantannasy/Downloads/frame'
      ]
    }
  }
});
