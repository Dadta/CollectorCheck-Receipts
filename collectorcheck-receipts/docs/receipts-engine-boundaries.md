<!-- Receipts Engine Module Boundaries source: canonical structure and rules for the CollectorCheck‑Receipts engine. -->

# CollectorCheck‑Receipts — Receipts Engine Module Boundaries

The receipts engine is the core of CollectorCheck‑Receipts.  
It ingests files, normalizes them, extracts metadata, and prepares them for optional cloud sync and UI.

This document defines the **module boundaries**, **responsibilities**, and **rules** for the `/src` tree.  
All contributors must follow these boundaries to keep the system deterministic and coherent.

---

## High-Level Layout

```text
/src
  /ingestion          → folder watchers, routing, queues
  /normalization      → filenames, dates, vendors, categories
  /metadata           → OCR, PDF parsing, field extraction, heuristics
  /cloud              → optional sync adapters
  /utils              → shared deterministic utilities
  /ui                 → minimal browsing/export surfaces (optional)
```

Each directory has a clear, non-overlapping responsibility.

## Ingestion (`/src/ingestion`)
**Responsibility:**  
Watch folders, route files, build ingestion queues, and hand off to normalization/metadata.

**May do:**

- file-system watching
- routing decisions
- duplicate detection
- queue management
- basic validation

**Must not do:**

- normalization
- metadata inference
- cloud sync
- UI rendering

Ingestion produces **validated inputs** for normalization and metadata extraction.

## Normalization (`/src/normalization`)
**Responsibility:**  
Apply deterministic normalization rules to dates, vendors, filenames, categories, currency, and payment methods.

**May do:**

- date normalization (`YYYY-MM-DD`)
- vendor normalization (canonical names)
- filename normalization (`YYYY-MM-DD_vendor_total.ext`)
- category mapping
- currency/payment method normalization

**Must not do:**

- file watching
- metadata extraction from raw text
- cloud sync
- UI logic

Normalization consumes raw/partial metadata and produces **schema-aligned, stable fields**.

## Metadata (`/src/metadata`)
**Responsibility:**  
Convert raw files (images/PDFs) into structured metadata conforming to `metadata-schema.md`.

**May do:**

- OCR (images)
- PDF text extraction
- text normalization
- field extraction (date, total, vendor, items, etc.)
- deterministic heuristics

**Must not do:**

- file watching
- routing
- filename normalization
- cloud sync
- UI rendering

Metadata modules produce **complete receipt objects** ready for normalization and downstream use.

## Cloud (`/src/cloud`)
**Responsibility:**  
Optionally sync normalized files and metadata to cloud providers via the canonical adapter interface.

**May do:**

- compute deterministic remote paths
- upload normalized files
- upload metadata JSON
- verify connection status

**Must not do:**

- modify local files
- perform ingestion or normalization
- infer metadata
- introduce nondeterministic identifiers

Cloud modules operate on **already-normalized receipts** and are strictly optional.

## Utils (`/src/utils`)
**Responsibility:**  
Provide shared, deterministic utilities used across modules.

**May do:**

- pure helper functions
- hashing utilities
- path helpers
- small, reusable transformations

**Must not do:**

- file watching
- direct cloud calls
- UI rendering
- module-specific logic (e.g., vendor-specific rules)

Utils must remain **generic, pure, and deterministic**.

## UI (`/src/ui`) (Optional)
**Responsibility:**  
Provide minimal browsing and export surfaces for receipts.

**May do:**

- list receipts
- show metadata
- filter/search
- export to CSV/JSON

**Must not do:**

- ingestion
- normalization
- metadata extraction
- cloud sync logic

UI consumes **normalized, schema-aligned receipts** and never mutates engine behavior.

## Cross-Module Rules

- **No circular dependencies** between `/ingestion`, `/normalization`, `/metadata`, `/cloud`, `/ui`.
- `/ingestion` may depend on `/metadata` and `/normalization`, but not vice versa.
- `/cloud` may depend on `/normalization` and `/utils`, but not on `/ingestion`.
- `/ui` may depend on `/metadata`, `/normalization`, and `/utils`, but not on `/ingestion` internals.
- `/utils` must not depend on any other `/src` directory.

## Determinism and Boundaries
All modules must:

- produce deterministic output for identical input
- avoid hidden state
- avoid nondeterministic ordering
- respect the metadata schema
- respect normalization rules
- respect ingestion invariants
- respect cloud adapter interface

Boundary violations (e.g., normalization logic inside ingestion) must be refactored.

## Extension Guidelines
New modules must:

- live in the correct directory
- follow naming conventions (`style-guide.md`)
- respect existing boundaries
- be deterministic
- include tests
- update documentation if they introduce new behavior

Examples:

- new OCR engine → `/src/metadata/ocr-engines`
- new cloud provider → `/src/cloud`
- new normalization rule → `/src/normalization`
- new UI view → `/src/ui`

## Summary
The receipts engine is a modular, deterministic system.  
These boundaries keep CollectorCheck‑Receipts clear, stable, and contributor-friendly as it grows.

All contributors must follow these module boundaries exactly.