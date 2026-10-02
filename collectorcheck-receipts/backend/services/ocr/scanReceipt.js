export async function scanReceipt(imageBuffer) {
  // TODO: integrate real OCR later
  // For now, return a static parsed receipt structure
  return {
    merchant: "Unknown Merchant",
    date: new Date().toISOString(),
    total: 0.00,
    category: "Uncategorized",
    source: "scan",
    raw: "stub-ocr-output"
  };
}