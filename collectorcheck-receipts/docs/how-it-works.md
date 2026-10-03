# How CollectorCheck Works

CollectorCheck is a small receipts engine designed to make expense documentation simple, reliable, and easy to audit. It focuses on one job: turning raw receipts into clean, structured records.

## Core Flow

1. **Upload a receipt**  
   Users submit a photo, PDF, or digital receipt.

2. **Extract the fields**  
   CollectorCheck parses the essential data:
   - merchant  
   - date  
   - total  
   - category  
   - payment method  
   - optional notes  

3. **Store the record**  
   The receipt becomes a structured entry in SQLite.  
   No external dependencies. No cloud lock‑in.

4. **Generate summaries**  
   Users can produce:
   - monthly expense summaries  
   - gig‑work earnings/expense bundles  
   - exportable CSVs  
   - clean audit trails  

## Why This Works Well

CollectorCheck stays small and predictable:
- no complex ingestion pipeline  
- no multi‑service architecture  
- no platform overhead  
- easy to extend with small modules  

This makes it ideal for contributors and ideal for users who just need receipts handled cleanly.