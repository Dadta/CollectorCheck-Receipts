<!-- Contributor Guide source: this file is the single-source text for contributor onboarding. -->

# CollectorCheck‑Receipts — Contributor Guide

CollectorCheck‑Receipts is built for clarity, determinism, and contributor friendliness.  
This guide explains how the project works, how to contribute effectively, and how to stay aligned with the architecture and style of the ecosystem.

---

## Philosophy

CollectorCheck‑Receipts follows three principles:

1. **Deterministic workflows**  
   Every ingestion, normalization, and routing step should behave the same way every time.

2. **Minimal, readable code paths**  
   No complexity unless it earns its place. Small modules, clear naming, predictable flow.

3. **Zero telemetry, zero monetization, zero lock‑in**  
   The project is free, open‑source, and designed for long‑term stability.

If you contribute with these principles in mind, your work will fit naturally into the ecosystem.

---

## Project Structure
```
/collectorcheck-receipts
/docs                → canonical documentation sources
/branding            → visual identity assets
/src                 → ingestion logic, normalization rules, automation utilities
/tests               → deterministic test suite
README.md            → mirrored intro
```
Documentation surfaces are **single-source**.  
All public-facing text mirrors from `/docs`.

---

## How to Contribute

### 1. Pick an Issue
Start with:

- **Issues → Good First Issue**
- **Issues → Help Wanted**

These are curated for new contributors.

### 2. Keep Changes Small
CollectorCheck prefers:

- small PRs  
- isolated improvements  
- single-purpose commits  
- readable diffs  

Large refactors should be discussed first in the pinned discussion thread.

### 3. Follow the Style
- Use clear, modern JavaScript/TypeScript patterns.  
- Avoid unnecessary abstractions.  
- Prefer pure functions and deterministic modules.  
- Keep naming consistent with existing files.

### 4. Write Deterministic Code
All ingestion and normalization logic must:

- behave identically across runs  
- avoid hidden state  
- avoid nondeterministic ordering  
- produce predictable output

If a function can be made deterministic, it should be.

### 5. Add Tests
Every new module should include:

- input → output tests  
- edge-case tests  
- deterministic behavior checks  

Tests should be readable and minimal.

### 6. Document Your Work
Update:

- `/docs` (canonical source)  
- `README.md` (mirrors)  
- relevant comments in code  

Documentation is part of the contribution.

---

## Contribution Areas

High-impact areas include:

- Windows automation (routing, renaming, ingestion)  
- OCR accuracy improvements  
- PDF parsing and metadata extraction  
- Cloud sync adapters  
- Normalization rules  
- Error handling and logging  
- Minimal UI for browsing receipts  
- Documentation and architectural notes  

If you’re unsure where to start, ask in the pinned discussion thread.

---

## Pull Request Process

1. Fork the repo  
2. Create a feature branch  
3. Make small, isolated commits  
4. Ensure tests pass  
5. Submit a PR  
6. Participate in review  
7. Update PR if needed  
8. Merge after approval

PRs run through automated checks and manual review.

---

## Communication

Use the pinned discussion thread for:

- technical questions  
- design proposals  
- integration points  
- architectural discussions  

CollectorCheck‑Receipts is designed to be clear, modern, and easy to extend.  
Welcome to the contributor community.