# Ditto

Ditto is the identity substrate for the Continuity Engine. It associates continuity records and artifact provenance with a stable identity, summarizes that history, and prepares identity-centered continuity documents for downstream systems.

## CollectorCheck to Ditto to Dadtabus

CollectorCheck verifies and stores artifact details and provenance. Ditto binds that artifact provenance to an identity and combines it with the identity's continuity records, preserving the artifact-to-identity relationship in an insurance-aligned document. Dadtabus can then route the identity and its continuity context to global continuity rails. CollectorCheck owns artifact verification, Ditto owns identity binding and aggregation, and Dadtabus owns onward routing.

## Starter API

- `identity.js` exports the `Identity` model with record attachment and continuity summaries.
- `continuityRecord.js` exports `createContinuityRecord`.
- `provenanceBinder.js` exports `bindProvenance` and `getProvenanceMap`.
- `insuranceDocument.js` exports `generateInsuranceDocument`.