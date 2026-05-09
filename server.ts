import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import admin from 'firebase-admin';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('Starting server initialization...');

  // Initialize Firebase Admin safely
  let db: any;
  let bucket: any;
  let firebaseConfig: any = {};

  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket
        });
      }
      bucket = admin.storage().bucket();
      db = admin.firestore();
      console.log('Firebase initialized successfully');
    } else {
      console.warn('firebase-applet-config.json not found, some features will be disabled');
    }
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err);
  }

  // Use memory storage for Buffer-based upload
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // API Route for file uploads to Firebase Storage
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!bucket) return res.status(500).json({ error: 'Storage not initialized' });
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype } = req.file;
    const fileName = `uploads/${Date.now()}_${originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const file = bucket.file(fileName);

    try {
      console.log('Attempting upload to Firebase Storage:', fileName);
      await file.save(buffer, {
        metadata: { contentType: mimetype },
        public: true // Make file public
      });
      console.log('Upload successful');

      const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      res.json({ url });
    } catch (err: any) {
      console.error('Firebase upload error detailed:', err);
      res.status(500).json({ error: 'Failed to upload to Firebase: ' + err.message });
    }
  });

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const handleIndexRequest = async (req: express.Request, res: express.Response, vite?: any) => {
    try {
      const url = req.originalUrl;
      let template: string;
      
      if (vite) {
        template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.resolve(process.cwd(), 'dist', 'index.html'), 'utf-8');
      }

      // Fetch dynamic settings from Firestore
      let settings: any = {};
      let heroData: any = {};
      if (db) {
        try {
          const [settingsDoc, heroDoc] = await Promise.all([
            db.collection('settings').doc('global').get(),
            db.collection('settings').doc('hero').get()
          ]);
          
          if (settingsDoc.exists) settings = settingsDoc.data() || {};
          if (heroDoc.exists) heroData = heroDoc.data() || {};
        } catch (err) {
          console.warn('Could not fetch dynamic settings, using defaults');
        }
      }
      
      const title = settings.title || 'Den pro Brno';
      const description = settings.description || 'Den pro Brno je kulturně-komunitní festival, který spojuje lidi a oslavuje naše město.';
      const ogTitle = settings.ogTitle || title;
      const ogDescription = settings.ogDescription || description;
      const faviconUrl = settings.faviconUrl || '';
      const logoUrl = settings.logoPassive || '';
      const heroImageUrl = heroData.imageUrl || '';
      const gaMeasurementId = settings.gaMeasurementId || '';

      // Perform replacements with more robust regex (case insensitive, handles spacing)
      let html = template
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
        .replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`)
        .replace(/<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${ogTitle}" />`)
        .replace(/<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${ogDescription}" />`);

      // Inject preloads for critical images
      let preloadTags = '';
      if (logoUrl) preloadTags += `<link rel="preload" as="image" href="${logoUrl}" />\n  `;
      if (heroImageUrl) preloadTags += `<link rel="preload" as="image" href="${heroImageUrl}" />\n  `;
      
      if (preloadTags) {
        html = html.replace(/<\/head>/i, `${preloadTags}</head>`);
      }

      console.log(`Serving page with injected SEO and preloads: "${title}"`);

      // Inject favicon if it's there
      if (faviconUrl) {
         if (/<link\s+[^>]*rel=["']icon["']/.test(html)) {
           html = html.replace(/<link\s+[^>]*rel=["']icon["'][^>]*\/?>/i, `<link rel="icon" href="${faviconUrl}" />`);
         } else {
           html = html.replace(/<\/head>/i, `  <link rel="icon" href="${faviconUrl}" />\n  </head>`);
         }
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      console.error('Index request error:', e);
      res.status(500).end(e.message);
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom', // Change to custom to handle index.html manually
    });
    app.use(vite.middlewares);
    
    // Explicitly handle index.html for all other routes in dev
    app.get('*', (req, res, next) => {
      // Skip API routes and static files that Vite should handle
      if (req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) {
        return next();
      }
      handleIndexRequest(req, res, vite);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files but intercept the index.html path
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      handleIndexRequest(req, res);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
