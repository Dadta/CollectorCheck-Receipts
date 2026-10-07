<!-- Architecture Overview source: this file is the single-source system description for contributors. -->

# CollectorCheck‑Receipts — Architecture Overview

CollectorCheck‑Receipts is a deterministic Windows ingestion and normalization engine for receipts.  
Its architecture is built around clarity, predictability, and modularity, enabling contributors to extend the system without introducing complexity or nondeterministic behavior.

This overview explains how the system is structured, how data flows through it, and where contributors can safely add new functionality.

---

## Core Principles

The architecture follows three invariants:

1. **Deterministic ingestion**  
   Every receipt follows the same path through the system, producing predictable output.

2. **Local-first automation**  
   Windows file‑system events drive ingestion, routing, and normalization.

3. **Modular components**  
   OCR, parsing, metadata extraction, and cloud sync adapters are isolated modules.

These principles ensure the system remains stable, testable, and contributor‑friendly.

---

## High-Level Flow
```
Mobile → Windows Ingestion → Normalization → Metadata Extraction → Cloud Sync (optional)
```

### 1. Mobile Input
Receipts originate from mobile scanning apps or device cameras.  
They are uploaded as standardized payloads:

- JPEG or PNG images  
- PDF scans  
- structured metadata (optional)

The mobile layer is intentionally simple: it produces files, not logic.

---

### 2. Windows Ingestion Pipeline

The ingestion engine is the heart of CollectorCheck‑Receipts.  
It is built around Windows automation primitives:

- file‑system watchers  
- routing rules  
- deterministic naming  
- local processing queues  

The ingestion pipeline performs:

- folder watching  
- file routing  
- normalization  
- metadata extraction  
- preparation for cloud sync  

All logic is local, offline‑capable, and telemetry‑free.

---

### 3. Normalization Layer

Normalization ensures every receipt follows a consistent structure:

- predictable filenames  
- standardized metadata fields  
- consistent output directories  
- stable formats for downstream tools  

Normalization rules are modular and easy to extend.

---

### 4. Metadata Extraction

Metadata extraction converts raw receipts into structured data:

- vendor  
- date  
- total  
- category  
- payment method  

Extraction modules are pluggable:

- OCR engines  
- PDF parsers  
- regex‑based extractors  
- ML‑assisted parsers (optional)

Each module is deterministic and testable.

---

### 5. Cloud Sync (Optional)

CollectorCheck supports optional cloud storage for continuity:

- OneDrive  
- Dropbox  
- Google Drive  
- custom adapters  

Cloud sync is an adapter layer, not a core dependency.  
The system works fully offline.

---

## Repository Structure
```
/collectorcheck-receipts
/src
/ingestion          → folder watchers, routing logic
/normalization      → naming rules, format standardization
/metadata           → OCR, parsing, extraction modules
/cloud              → sync adapters (optional)
/utils              → shared deterministic utilities
/tests              → deterministic test suite
/docs               → canonical documentation sources
/branding           → visual identity assets
README.md           → mirrored intro
```
All public-facing documentation mirrors from `/docs`.

---

## Extension Points

Contributors can safely extend:

- ingestion rules  
- normalization modules  
- OCR engines  
- PDF parsers  
- metadata extractors  
- cloud sync adapters  
- error handling  
- logging  
- minimal UI components  

Each extension must preserve determinism and readability.

---

## Deterministic Testing

The test suite enforces:

- stable input → output behavior  
- predictable ordering  
- no hidden state  
- reproducible results  

Every new module must include deterministic tests.

---

## Design Goals

CollectorCheck‑Receipts aims for:

- clarity  
- modularity  
- Windows-native automation  
- predictable workflows  
- contributor-friendly code paths  
- zero telemetry  
- zero monetization  
- long-term stability  

This architecture enables the project to grow without losing its simplicity.

---

## Entry Point for Contributors

If you want to extend the system:

1. Read this architecture overview  
2. Explore `/src` modules  
3. Review normalization and metadata rules  
4. Check open issues  
5. Propose enhancements in the pinned discussion thread  

CollectorCheck‑Receipts is designed to be modern, clear, and easy to extend.  
Welcome to the architecture.