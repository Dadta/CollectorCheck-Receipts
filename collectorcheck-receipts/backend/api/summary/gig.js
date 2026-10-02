import { getDb } from "../../db/client.js";

export default function registerGigSummary(app) {
  app.get('/api/summary/gig', async (req, res) => {
    try {
      const db = await getDb();

      const receipts = await db.all(`SELECT * FROM receipts`);
      const totalReceipts = receipts.length;
      const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0);

      const categories = {};
      for (const r of receipts) {
        const cat = r.category || "Uncategorized";
        categories[cat] = (categories[cat] || 0) + (r.total || 0);
      }

      const summary = {
        totalReceipts,
        totalSpent,
        categories: Object.entries(categories).map(([name, amount]) => ({ name, amount })),
        lastUpdated: new Date().toISOString(),
        source: "sqlite"
      };

      res.json({ status: 'ok', summary });
    } catch (err) {
      console.error("Gig summary error:", err);
      res.status(500).json({ status: 'error', message: 'Gig summary failed' });
    }
  });
}