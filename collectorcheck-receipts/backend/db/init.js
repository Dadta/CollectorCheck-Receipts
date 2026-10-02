import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createDb() {
  const db = await open({
    filename: path.join(__dirname, 'collectorcheck.db'),
    driver: sqlite3.Database
  });

  // Receipts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchant TEXT,
      date TEXT,
      total REAL,
      category TEXT,
      source TEXT,
      raw TEXT
    );
  `);

  // Billers table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS billers (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT
    );
  `);

  // Gig summary table (stub for now)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS gig_summary (
      id INTEGER PRIMARY KEY,
      totalReceipts INTEGER,
      totalSpent REAL,
      lastUpdated TEXT
    );
  `);

  return db;
}