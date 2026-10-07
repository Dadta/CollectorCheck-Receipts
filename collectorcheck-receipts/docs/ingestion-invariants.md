<!-- Ingestion Pipeline Invariants source: this file defines the deterministic ingestion rules for CollectorCheck‑Receipts. -->

# CollectorCheck‑Receipts — Ingestion Pipeline Invariants

The ingestion pipeline is the foundation of CollectorCheck‑Receipts.  
It watches folders, routes files, extracts metadata, and prepares receipts for normalization and cloud sync.

These invariants define how ingestion must behave.  
All ingestion modules must follow these rules exactly.

---

## Core Principles

1. **Deterministic processing**  
   The same file must always produce the same ingestion result.

2. **Stable ordering**  
   Files are processed in a predictable, deterministic order.

3. **Local-first automation**  
   Ingestion relies on Windows file-system events and local processing.

4. **No hidden state**  
   Ingestion must not depend on external state, timestamps, or nondeterministic factors.

5. **Idempotence**  
   Re-ingesting the same file must not produce duplicate or conflicting results.

---

## Folder Watching

### Rules

- Use Windows-native file-system watchers.
- Watch only explicitly configured directories.
- Watchers must:
  - detect new files
  - detect modified files
  - ignore temporary or partial files
- Watchers must debounce events to avoid duplicate triggers.
- Watchers must never rely on polling unless explicitly configured.

### Deterministic Behavior

- A file is considered “ready” only when:
  - it is fully written
  - it is not locked
  - its size has stabilized

---

## Routing Logic

### Rules

- Routing must be deterministic:
  - same file → same route
  - same vendor → same destination
  - same category → same folder
- Routing must not depend on:
  - timestamps
  - random values
  - nondeterministic ordering

### Routing Inputs

Routing may use:

- file extension  
- normalized vendor  
- normalized date  
- metadata extraction results  
- configured routing rules  

Routing must not use:

- file creation time  
- file modification time  
- OS-level nondeterministic attributes  

---

## Processing Order

### Rules

- Files must be processed in deterministic order:
  - lexicographically by filename  
  - or by stable hash  
- Never process based on:
  - arrival time  
  - watcher event order  
  - OS scheduling  

### Queue Behavior

- Ingestion uses a deterministic queue.
- Queue order must be stable across runs.
- Queue must not reorder items nondeterministically.

---

## File Validation

### Rules

A file must pass validation before ingestion:

- extension is supported (`jpg`, `jpeg`, `png`, `pdf`)
- file is readable
- file is not empty
- file is not a temporary file
- file is not a duplicate of an already ingested file

### Duplicate Detection

Duplicates are detected using:

- deterministic hashing  
- normalized filename comparison  
- metadata equivalence  

Duplicates must not be re-ingested.

---

## Metadata Extraction

### Rules

- Metadata extraction must be deterministic.
- OCR engines must produce stable output for identical input.
- PDF parsing must follow stable rules.
- Extraction must not rely on:
  - timestamps
  - OS locale
  - nondeterministic heuristics

### Failure Modes

If extraction fails:

- return a structured error object  
- never throw nondeterministic exceptions  
- never produce partial metadata  

---

## Normalization Hand-off

### Rules

- Ingestion must produce a complete metadata object.
- Ingestion must not perform normalization itself.
- Ingestion must pass:
  - raw metadata  
  - raw file path  
  - ingestion source  
  - ingestion version  
- Normalization rules are applied only after ingestion.

---

## Cloud Sync Preparation

### Rules

- Cloud sync is optional.
- Ingestion must prepare:
  - normalized file path
  - metadata object
  - sync-ready structure
- Ingestion must not perform the sync itself.

---

## Logging

### Rules

- Logging must be deterministic.
- Log entries must include:
  - file path  
  - ingestion module  
  - ingestion version  
  - deterministic error codes  
- Logs must not include:
  - timestamps (except for debugging mode)  
  - nondeterministic identifiers  

---

## Error Handling

### Rules

- Errors must be explicit.
- Errors must be deterministic.
- Errors must not depend on OS-level messages.
- Errors must not be swallowed silently.

---

## Idempotence

### Rules

Re-ingesting the same file must:

- produce the same metadata  
- produce the same normalized filename  
- produce the same routing result  
- not create duplicates  
- not overwrite normalized output unless explicitly configured  

---

## Extension Rules

Any new ingestion module must:

- follow all invariants  
- be deterministic  
- be documented here  
- be backward-compatible  
- not break existing ingestion behavior  

---

## Summary

The ingestion pipeline is the deterministic engine that powers CollectorCheck‑Receipts.  
These invariants ensure ingestion is predictable, stable, and contributor-friendly.

All contributors must follow these rules exactly.