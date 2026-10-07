<!-- Metadata Schema source: this file defines the canonical receipt metadata model for the project. -->

# CollectorCheck‑Receipts — Metadata Schema

CollectorCheck‑Receipts uses a deterministic, extensible metadata model for all receipts.  
This schema is the single source of truth for ingestion, normalization, cloud sync, and UI.

All modules that read or write receipt data must conform to this schema.

---

## Core Receipt Object

Each receipt is represented as a structured object:

```json
{
  "id": "string",
  "source": "string",
  "vendor": "string",
  "date": "string",
  "total": "number",
  "currency": "string",
  "category": "string",
  "paymentMethod": "string",
  "tax": {
    "subtotal": "number",
    "taxAmount": "number",
    "taxRate": "number"
  },
  "items": [
    {
      "description": "string",
      "quantity": "number",
      "unitPrice": "number",
      "lineTotal": "number",
      "category": "string"
    }
  ],
  "flags": {
    "isEstimate": "boolean",
    "isRefund": "boolean",
    "isSubscription": "boolean"
  },
  "paths": {
    "rawFile": "string",
    "normalizedFile": "string",
    "cloudLocation": "string"
  },
  "metadata": {
    "createdAt": "string",
    "updatedAt": "string",
    "ingestionSource": "string",
    "ingestionVersion": "string"
  }
}
```

## Field Definitions
**id:**  
Globally unique identifier for the receipt (UUID or deterministic hash).

**source:**  
Origin of the receipt (e.g. `"mobile-scan"`, `"email-import"`, `"manual-upload"`).

**vendor:**  
Normalized vendor name (e.g. `"Costco"`, `"Amazon"`).

**date:**  
ISO 8601 date string: `YYYY-MM-DD`.

**total:**  
Final total amount, including tax.

**currency:**  
ISO 4217 currency code (e.g. `"USD"`, `"CAD"`).

**category:**  
High-level category (e.g. `"groceries"`, `"transportation"`, `"software"`).

**paymentMethod:**  
Normalized payment method (e.g. `"credit-card"`, `"debit-card"`, `"cash"`, `"gift-card"`).

## Tax Object
**tax.subtotal:**  
Pre‑tax subtotal.

**tax.taxAmount:**  
Total tax amount.

**tax.taxRate:**  
Effective tax rate as a decimal (e.g. `0.13`).

If tax is unknown, fields may be `null` but must still exist.

## Line Items
Each item in `items[]`:

**description:**  
Human‑readable item description.

**quantity:**  
Numeric quantity (default `1` if omitted).

**unitPrice:**  
Price per unit.

**lineTotal:**  
`quantity * unitPrice` (deterministic).

**category:**  
Optional per‑item category (may differ from receipt‑level category).

## Flags
**flags.isEstimate:**  
`true` if the receipt represents an estimate or quote.

**flags.isRefund:**  
`true` if the receipt represents a refund or return.

**flags.isSubscription:**  
`true` if the receipt is part of a recurring subscription.

Flags must be explicit booleans (`true`/`false`), never omitted.

## Paths
**paths.rawFile:**  
Path to the original file (image/PDF).

**paths.normalizedFile:**  
Path to the normalized, processed file.

**paths.cloudLocation:**  
Cloud storage path or identifier (optional).

These paths are deterministic outputs of the ingestion and normalization pipeline.

## Metadata
**metadata.createdAt:**  
ISO timestamp when the receipt object was first created.

**metadata.updatedAt:**  
ISO timestamp when the receipt object was last modified.

**metadata.ingestionSource:**  
Module or adapter that ingested the receipt (e.g. `"watcher-desktop"`, `"email-parser"`).

**metadata.ingestionVersion:**  
Version string for the ingestion pipeline (e.g. `"ingestion-v1.2.0"`).

## Determinism Requirements
All modules must:

- produce `date` in `YYYY-MM-DD`
- normalize `vendor` consistently
- keep `id` stable across runs
- compute `lineTotal` deterministically
- avoid hidden fields or ad‑hoc extensions

Any extension to the schema must be:

- documented in this file
- added as explicit fields
- kept backward‑compatible where possible

## Extension Fields (Reserved)
Future extensions may include:

- `tags: string[]`
- `projectCode: string`
- `businessUnit: string`
- `taxRegion: string`

These must be added here before use.

## Usage

- Ingestion modules create receipt objects conforming to this schema.
- Normalization modules adjust fields but never remove required ones.
- Cloud adapters serialize this schema for storage and sync.
- UI components render this schema for browsing and export.

This metadata model is the backbone of CollectorCheck‑Receipts.  
All contributors should treat it as canonical.