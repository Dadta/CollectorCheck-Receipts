import test from "node:test";
import assert from "node:assert/strict";

import { scanReceipt } from "../backend/services/ocr/scanReceipt.js";
import { syncBillers } from "../backend/services/billers/syncBillers.js";
import { getGigSummary } from "../backend/services/summary/gigSummary.js";

test("OCR stub returns a structured scan receipt", async () => {
  const receipt = await scanReceipt(null);

  assert.equal(receipt.merchant, "Unknown Merchant");
  assert.equal(receipt.total, 0);
  assert.equal(receipt.category, "Uncategorized");
  assert.equal(receipt.source, "scan");
  assert.equal(Number.isNaN(Date.parse(receipt.date)), false);
});

test("biller sync stub returns unique biller records", async () => {
  const billers = await syncBillers();

  assert.equal(billers.length, 3);
  assert.equal(new Set(billers.map((biller) => biller.id)).size, billers.length);
  assert.ok(billers.every((biller) => biller.id && biller.name && biller.type));
});

test("gig summary stub returns category totals", async () => {
  const summary = await getGigSummary();

  assert.equal(summary.totalReceipts, 3);
  assert.equal(summary.totalSpent, 125.5);
  assert.equal(summary.categories.reduce((sum, category) => sum + category.amount, 0), 125.5);
  assert.equal(summary.source, "stub");
});