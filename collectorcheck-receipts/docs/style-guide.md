<!-- Style Guide source: this file is the single-source style and conventions reference for the project. -->

# CollectorCheck‑Receipts — Style Guide

CollectorCheck‑Receipts is built around clarity, determinism, and contributor friendliness.  
This guide defines the project’s coding style, naming conventions, documentation rules, and architectural expectations.  
All contributors should follow these patterns to keep the ecosystem coherent and predictable.

---

## Core Style Principles

1. **Determinism first**  
   Every module should behave identically across runs.  
   No hidden state, no nondeterministic ordering, no implicit side effects.

2. **Minimalism**  
   Small modules, readable functions, predictable flow.  
   No abstractions unless they earn their place.

3. **Windows-native automation**  
   File-system events, watchers, routing logic, and local processing are first-class.

4. **Zero telemetry, zero monetization**  
   No analytics, no tracking, no external calls unless explicitly required.

5. **Contributor-friendly clarity**  
   Code should be easy to read, easy to test, and easy to extend.

---

## Naming Conventions

### Files and Directories
Use **lowercase-kebab-case** for files and directories:
```
ingestion-engine/
metadata-extraction/
cloud-adapters/
normalization-rules/
```
### Modules
Use **descriptive module names** that reflect deterministic behavior:
```
normalize-filename.js
extract-metadata.js
route-file.js
watch-folders.js
```
### Functions
Use **verb-first camelCase**:
```js
parsePdf()
extractVendor()
normalizeDate()
routeToFolder()
```
### Variables
Use **clear, descriptive names**:
```js
receiptPath
metadata
normalizedName
cloudAdapter
```
Avoid single-letter variables except for loop counters.

---

## Code Style

### JavaScript / TypeScript
CollectorCheck uses modern JS/TS patterns:

- `const` by default  
- pure functions where possible  
- no implicit globals  
- no magic numbers  
- no nested complexity  
- prefer early returns  
- prefer composition over inheritance  

### Imports
Use explicit imports:

```ts
import { extractMetadata } from '../metadata/extract-metadata.js'
```

Avoid wildcard imports.

### Error Handling
Errors should be:

- explicit
- logged clearly
- deterministic
- never swallowed silently

Example:

```ts
try {
  const metadata = extractMetadata(file)
} catch (err) {
  logError('Metadata extraction failed', err)
  return null
}
```

## Directory Structure Rules
The `/src` directory follows strict boundaries:

```
/src
  /ingestion          → folder watchers, routing logic
  /normalization      → naming rules, format standardization
  /metadata           → OCR, parsing, extraction modules
  /cloud              → sync adapters (optional)
  /utils              → shared deterministic utilities
```

Rules:

- No cross‑module imports that break boundaries
- Utilities must be pure and deterministic
- Cloud adapters must not introduce nondeterminism
- Metadata modules must not depend on ingestion modules

## Documentation Rules
CollectorCheck uses **single-source documentation**:

- All canonical text lives in `/docs`
- Public surfaces (README, Discussions) mirror from `/docs`
- No editing mirrored surfaces directly
- Every canonical file must be committed, signed, and pushed

Mirrored surfaces must include a source marker:

```markdown
<!-- Mirrored from /docs/<file>.md -->
```

## Commit Style

### Signed Commits
All commits must be GPG‑signed:

```sh
git commit -S -m "Message"
```

### Commit Messages
Use clear, descriptive messages:

- “Add normalization rules for vendor names”
- “Improve PDF metadata extraction”
- “Refactor ingestion routing logic”
- “Add deterministic tests for OCR module”

Avoid vague messages like “fix stuff” or “update code”.

### Commit Scope
One commit = one purpose.  
Avoid multi‑purpose commits.

## Testing Style
Tests must be:

- deterministic
- readable
- minimal
- input → output focused
- free of nondeterministic dependencies

Example:

```ts
test('normalizeDate produces YYYY-MM-DD', () => {
  expect(normalizeDate('03/14/2024')).toBe('2024-03-14')
})
```

## PR Expectations
Pull requests should:

- be small
- be isolated
- include tests
- update documentation if needed
- follow naming and directory rules
- preserve determinism

Large changes should be discussed first in the pinned discussion thread.

## Style Violations
If a contribution violates:

- determinism
- naming conventions
- directory boundaries
- documentation rules
- commit style
- architectural invariants

it will be requested for revision before merging.

CollectorCheck’s clarity is its strength — contributors help preserve it.

## Final Notes
This style guide ensures CollectorCheck‑Receipts remains:

- modern
- readable
- deterministic
- Windows‑aligned
- contributor‑friendly
- stable for long-term growth

Welcome to the ecosystem.