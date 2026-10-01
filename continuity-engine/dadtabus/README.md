# Dadtabus

Dadtabus is the global continuity rail. It records continuity events in ledgers, exposes a starter in-memory treasury, and provides the final routing layer for continuity shared across systems.

## CollectorCheck to Ditto to Dadtabus

CollectorCheck verifies artifacts and retains their provenance. Ditto binds that artifact provenance and related continuity records to an identity. Dadtabus receives the identity's continuity events, records them in a ledger, and makes the resulting continuity history available to global rails. Each module has a distinct role: CollectorCheck verifies artifacts, Ditto supplies the identity substrate, and Dadtabus handles ledgering and onward continuity routing.

## Starter API

- `ledger.js` exports `ContinuityLedger` with entry, balance, and export methods.
- `continuityToken.js` exports `createToken(sourceModule, payload)`.
- `treasury.js` exports in-memory `credit`, `debit`, and `getStatement` methods. Balances are process-local and reset when the process exits.
- `railBinder.js` exports `bindIdentityToLedger` and `recordContinuityEvent`.
- `index.js` exposes the module APIs from one entry point.