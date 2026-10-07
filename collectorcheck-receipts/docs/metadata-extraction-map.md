<!-- Metadata Extraction Module Map source: canonical structure for metadata extraction in CollectorCheck‑Receipts. -->

# CollectorCheck‑Receipts — Metadata Extraction Module Map

Metadata extraction converts raw receipt files (images, PDFs) into structured metadata conforming to the canonical schema.  
This subsystem is modular, deterministic, and designed for clarity and contributor friendliness.

This map defines the module boundaries, responsibilities, and extension points for all metadata extraction components.

---

## Core Principles

1. **Deterministic output**  
   Identical input must always produce identical metadata.

2. **Modular architecture**  
   OCR, PDF parsing, regex extraction, and heuristics are isolated modules.

3. **Non-destructive behavior**  
   Extraction must never remove or overwrite raw data.

4. **Schema alignment**  
   All output must conform to `metadata-schema.md`.

5. **Predictable failure modes**  
   Extraction must return structured errors, never nondeterministic exceptions.

---

## High-Level Structure
```
/src/metadata
/ocr-engines
/pdf-parsers
/text-normalizers
/field-extractors
/heuristics
/pipeline
```
Each directory contains deterministic modules with clear responsibilities.

---

## Module Breakdown

### 1. OCR Engines (`/ocr-engines`)

Responsible for converting images into text.

Examples:

- `tesseract-engine.js`
- `windows-ocr-engine.js`
- `experimental-ml-ocr.js` (optional)

**Rules:**

- Must produce stable text for identical input.
- Must not introduce nondeterministic ordering.
- Must not perform normalization (handled later).
- Must return:
  ```json
  {
    "text": "string",
    "confidence": "number",
    "engine": "string"
  }
  ```

### 2. PDF Parsers (`/pdf-parsers`)
Responsible for extracting text from PDF receipts.

Examples:

- `pdfjs-parser.js`
- `native-windows-pdf-parser.js`

**Rules:**

- Must extract text deterministically.
- Must preserve ordering of text blocks.
- Must not infer metadata (handled by field extractors).
- Must return:
  ```json
  {
    "pages": ["string"],
    "parser": "string"
  }
  ```

### 3. Text Normalizers (`/text-normalizers`)
Responsible for cleaning raw OCR/PDF text.

Examples:

- `strip-whitespace.js`
- `remove-boilerplate.js`
- `normalize-encoding.js`

**Rules:**

- Must not infer metadata.
- Must not remove meaningful text.
- Must produce stable output across runs.
- Must return normalized text blocks.

### 4. Field Extractors (`/field-extractors`)
Responsible for extracting structured fields from normalized text.

Examples:

- `extract-date.js`
- `extract-total.js`
- `extract-vendor.js`
- `extract-payment-method.js`
- `extract-line-items.js`

**Rules:**

- Must follow normalization rules.
- Must produce deterministic values.
- Must return structured fields:
  ```json
  {
    "vendor": "string",
    "date": "string",
    "total": "number",
    "currency": "string",
    "paymentMethod": "string",
    "items": []
  }
  ```

### 5. Heuristics (`/heuristics`)
Responsible for resolving ambiguous cases.

Examples:

- `resolve-ambiguous-date.js`
- `infer-currency.js`
- `infer-category.js`

**Rules:**

- Must be deterministic.
- Must not rely on timestamps or OS locale.
- Must use stable vendor-region mappings.
- Must return resolved values or structured errors.

### 6. Metadata Pipeline (`/pipeline`)
Responsible for orchestrating all extraction modules.

Example:

- `extract-metadata.js`

**Pipeline Steps:**

1. Detect file type (image/PDF).
2. Run OCR or PDF parser.
3. Normalize text.
4. Extract fields.
5. Apply heuristics.
6. Construct metadata object.
7. Validate against schema.
8. Return metadata or structured error.

**Rules:**

- Must be deterministic.
- Must not skip steps.
- Must not mutate raw input.
- Must return:
  ```json
  {
    "metadata": { ... },
    "errors": []
  }
  ```

## Deterministic Failure Modes
If extraction fails:

- return structured errors
- never throw nondeterministic exceptions
- never produce partial metadata
- never swallow errors silently

Example error:

```json
{
  "code": "OCR_FAILURE",
  "message": "OCR engine could not extract text",
  "engine": "tesseract"
}
```

## Extension Points
Contributors may add:

- new OCR engines
- new PDF parsers
- new field extractors
- new heuristics
- new pipeline steps

All extensions must:

- be deterministic
- be documented here
- be backward-compatible
- not break existing modules

## Summary
The metadata extraction subsystem is a modular, deterministic pipeline that converts raw receipts into structured metadata.
This map defines the boundaries and responsibilities of each module, ensuring clarity, stability, and contributor friendliness.

All contributors must follow this map exactly.