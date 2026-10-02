import { scanReceipt } from "../../services/ocr/scanReceipt.js";
import { getDb } from "../../db/client.js";

export default function registerReceiptScan(app) {
  app.post('/api/receipts/scan', async (req, res) => {
    try {
      const receipt = await scanReceipt(null);
      const db = await getDb();

      await db.run(
        `INSERT INTO receipts (merchant, date, total, category, source, raw)
         VALUES (?, ?, ?, ?, ?, ?)`,
        receipt.merchant,
        receipt.date,
        receipt.total,
        receipt.category,
        receipt.source,
        receipt.raw
      );

      res.json({ status: 'ok', receipt });
    } catch (err) {
      console.error("Scan error:", err);
      res.status(500).json({ status: 'error', message: 'Scan failed' });
    }
  });
}