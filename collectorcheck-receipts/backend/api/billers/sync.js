import { syncBillers } from "../../services/billers/syncBillers.js";
import { getDb } from "../../db/client.js";

export default function registerBillerSync(app) {
  app.get('/api/billers/sync', async (req, res) => {
    try {
      const billers = await syncBillers();
      const db = await getDb();

      for (const b of billers) {
        await db.run(
          `INSERT INTO billers (id, name, type)
           VALUES (?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET name = excluded.name, type = excluded.type`,
          b.id, b.name, b.type
        );
      }

      res.json({ status: 'ok', billers });
    } catch (err) {
      console.error("Biller sync error:", err);
      res.status(500).json({ status: 'error', message: 'Biller sync failed' });
    }
  });
}