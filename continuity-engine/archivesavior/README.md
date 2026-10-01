# Archive Savior

Archive Savior is the archivist engine. It preserves artifact provenance and continuity snapshots in structured archives, summarizes their history, and bundles them into exportable continuity packages.

## CollectorCheck to Ditto to Dadtabus to Archive Savior

CollectorCheck verifies artifact details and captures their provenance. Ditto associates the artifact and its history with an identity. Dadtabus routes the resulting continuity event along the global continuity rail. Archive Savior receives that routed context and preserves it as an archive with provenance steps and continuity snapshots, making the history available for later review and export.

## Starter API

- `archive.js` exports the `Archive` model.
- `provenanceChain.js` exports `createProvenanceStep(actor, action, payload)`.
- `snapshot.js` exports `createSnapshot(type, payload)`.
- `archiveBundler.js` exports `bundleArchive` and `exportBundle`.
- `archiveStore.js` exports in-memory archive CRUD operations.
- `index.js` exposes these APIs from one entry point.