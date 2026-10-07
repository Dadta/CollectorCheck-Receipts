<!-- Normalization Rules source: this file defines the deterministic normalization rules for CollectorCheck‑Receipts. -->

# CollectorCheck‑Receipts — Normalization Rules

Normalization ensures every receipt follows a consistent, deterministic structure.  
These rules apply to ingestion, metadata extraction, file naming, and downstream processing.

All modules must follow these rules exactly.  
No normalization logic may introduce nondeterminism.

---

## Core Principles

1. **Deterministic output**  
   The same input must always produce the same normalized result.

2. **Stable formatting**  
   Dates, vendors, filenames, and categories follow strict formats.

3. **Minimal transformation**  
   Normalize only what is necessary; avoid destructive changes.

4. **Schema alignment**  
   All normalized output must conform to `metadata-schema.md`.

---

## Date Normalization

### Input Variants
Receipts may contain dates in formats such as:

- `MM/DD/YYYY`
- `DD/MM/YYYY`
- `YYYY-MM-DD`
- `Month DD, YYYY`
- `DD Mon YYYY`
- OCR‑extracted ambiguous formats

### Normalized Format
All dates must be normalized to:
```
YYYY-MM-DD
```
### Rules

- Convert month names to numeric (`March` → `03`).
- Resolve ambiguous formats using locale heuristics:
  - If both day and month ≤ 12, prefer OCR context (e.g., vendor region).
  - Otherwise, infer from common patterns (e.g., `13/04/2024` → `2024-04-13`).
- Reject invalid dates deterministically.
- Store normalized date in `date` field of the metadata schema.

---

## Vendor Normalization

### Input Variants
Vendor names may appear as:

- OCR text  
- PDF text  
- logos  
- abbreviations  
- noisy strings (e.g., `COSTCO WHOLESALE #0421`)  

### Normalized Format
Vendor names must be normalized to a canonical vendor string:
```
Costco
Amazon
Walmart
Home Depot
Starbucks
```
### Rules

- Strip store numbers (`#0421` → removed).
- Remove suffixes like:
  - `WHOLESALE`
  - `SUPERCENTER`
  - `MARKETPLACE`
- Normalize casing (`COSTCO` → `Costco`).
- Use a vendor dictionary for known mappings.
- Unknown vendors:
  - Normalize casing
  - Remove punctuation
  - Preserve full string

---

## Filename Normalization

### Input Variants
Raw filenames may be:

- `IMG_20240314_192300.jpg`
- `scan123.pdf`
- `receipt.png`
- `2024-03-14 Costco.jpeg`

### Normalized Format
Normalized filenames must follow:
```
YYYY-MM-DD_vendor_total.ext
```
Example:
```
2024-03-14_Costco_89.23.pdf
```
### Rules

- Use normalized date.
- Use normalized vendor.
- Use normalized total (two decimal places).
- Replace spaces with hyphens.
- Lowercase file extensions.
- Reject filenames that cannot be normalized deterministically.

---

## Currency Normalization

### Rules

- Currency must be an ISO 4217 code.
- If currency is missing:
  - Infer from vendor region (e.g., Costco Canada → `CAD`).
  - Infer from OCR currency symbols (`$` → `USD` or `CAD` based on region).
- If ambiguous:
  - Default to `USD` unless vendor region indicates otherwise.

---

## Category Normalization

### Rules

- Categories must be drawn from a canonical list:
  - `groceries`
  - `transportation`
  - `software`
  - `hardware`
  - `electronics`
  - `food`
  - `services`
  - `misc`
- If category cannot be inferred:
  - Set to `misc`.
- Line‑item categories may differ from receipt‑level category.

---

## Payment Method Normalization

### Rules

- Normalize to:
  - `credit-card`
  - `debit-card`
  - `cash`
  - `gift-card`
  - `mobile-pay`
- Infer from OCR text:
  - `VISA`, `MC`, `AMEX` → `credit-card`
  - `DEBIT` → `debit-card`
  - `CASH` → `cash`
- Unknown methods → `credit-card` (default).

---

## Tax Normalization

### Rules

- Compute `taxRate` as:
  ```
  taxAmount / subtotal
  ```
- Round to 4 decimal places.
- If tax is missing:
  - Set `taxAmount = 0`
  - Set `taxRate = 0`
- All tax fields must exist even if zero.

---

## Line Item Normalization

### Rules

- `lineTotal = quantity * unitPrice`
- Round to two decimal places.
- If OCR fails:
  - Use fallback extraction rules.
- If line items are missing:
  - Represent as an empty array.

---

## Path Normalization

### Rules

- `paths.rawFile` must be the original file path.
- `paths.normalizedFile` must follow normalized filename rules.
- `paths.cloudLocation` must be deterministic if cloud sync is enabled.

---

## Deterministic Failure Modes

If normalization cannot proceed:

- return a structured error object  
- never throw nondeterministic exceptions  
- never silently skip fields  
- never produce partial normalization  

---

## Extension Rules

Any new normalization rule must:

- be documented here  
- be deterministic  
- be backward‑compatible  
- not break existing ingestion modules  

---

## Summary

Normalization is the backbone of CollectorCheck‑Receipts.  
These rules ensure every receipt is predictable, stable, and ready for ingestion, metadata extraction, cloud sync, and UI.

All contributors must follow these rules exactly.