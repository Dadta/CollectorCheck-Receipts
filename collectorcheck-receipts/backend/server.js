import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import serveStatic from 'serve-static';
import registerReceiptScan from './api/receipts/scan.js';
import registerBillerSync from './api/billers/sync.js';
import registerGigSummary from './api/summary/gig.js';
import { getDb } from './db/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use('/', serveStatic(path.join(__dirname, '../frontend')));
registerReceiptScan(app);
registerBillerSync(app);
registerGigSummary(app);

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await getDb();
    console.log('SQLite database initialized');

    app.listen(3001, () => {
      console.log('CollectorCheck Receipts backend running on port 3001');
    });
  } catch (err) {
    console.error('DB init error:', err);
    process.exitCode = 1;
  }
}

start();