# Continuity Engine Runtime

The runtime exposes the Continuity Pipeline to external systems over HTTP. `runtimeServer.js` accepts an event, `dispatcher.js` creates or accepts a PhoneBurp event and calls the [pipeline orchestrator](../pipeline/orchestrator.js), and `moduleRegistry.js` reports availability of the seven integration modules. Each request runs in an isolated in-memory orchestrator. No receipt or ledger state survives a restart, and ledgers are not shared across requests.

Install the engine dependency with `npm --prefix continuity-engine install` if needed, then run `node runtime/runtimeServer.js` from the repository root. The server listens on port 4001 by default. `GET /continuity/status` returns runtime health, configuration modes, and the registry (PhoneBurp, CastleFrenzy, HydroFrenzy, Archive Savior, CollectorCheck, Ditto, Dadtabus). Health checks confirm module entry points load; they do not contact external services. Modules do not currently publish versions, so registry versions are `unversioned`.

## Ingest API

`POST /continuity/ingest` accepts JSON and returns HTTP 201 with the full pipeline result: BurpEvent, profile, household ledger, dignity index, archive, artifact, identity, continuity token, and final Dadtabus ledger. Invalid input returns HTTP 400. A receipt can use `merchant`/`total` or `vendor`/`amount`.

```json
{
  "eventType": "burp",
  "receipt": { "merchant": "Corner Store", "total": 24.75, "category": "groceries" }
}
```

Omit `eventType` for a receipt-only event. A previously created PhoneBurp `burpEvent` may be supplied instead of `receipt`. For `eventType: "artifact"`, include an `artifact` object with a `name` and a `receipt` or `burpEvent`; for `eventType: "identity"`, include an `identity` object and a `receipt` or `burpEvent`. Either optional object may accompany a burp event. The pipeline does not claim true artifact verification: CollectorCheck currently provides `verification: { "status": "placeholder", "verified": false }`.

`runtimeConfig.js` reads `NODE_ENV`, `CONTINUITY_LOGGING` (`false` disables logging), `CONTINUITY_PERSISTENCE` (`memory`), `CONTINUITY_PIPELINE_MODE` (`synchronous`), and `PORT`. Unsupported modes fail at startup. `continuityLog.js` provides `logEvent`, `getLogs`, and `clearLogs` for an in-memory stream of event IDs; logs are not exposed via HTTP.