# Continuity Engine Runtime

The runtime exposes the Continuity Pipeline to external systems over HTTP. `runtimeServer.js` accepts an event, `dispatcher.js` creates or accepts a PhoneBurp event and calls the [pipeline orchestrator](../pipeline/orchestrator.js), and `moduleRegistry.js` reports availability of the seven integration modules. Each request runs in an isolated orchestrator; ledgers are not shared across requests. In `file` mode, completed run snapshots survive a restart, but live orchestrator state is not restored.

Install the engine dependency with `npm --prefix continuity-engine install` if needed, then run `node runtime/runtimeServer.js` from the repository root. The server listens on port 4001 by default. `GET /continuity/status` returns runtime health, configuration modes, and the registry (PhoneBurp, CastleFrenzy, HydroFrenzy, Archive Savior, CollectorCheck, Ditto, Dadtabus). Health checks confirm module entry points load; they do not contact external services. Modules do not currently publish versions, so registry versions are `unversioned`.

## Ingest API

`POST /continuity/ingest` and `POST /external/ingest` accept the same JSON and return HTTP 201 with the full pipeline result: BurpEvent, profile, household ledger, dignity index, archive, artifact, identity, continuity token, and final Dadtabus ledger. Invalid input returns HTTP 400. A receipt can use `merchant`/`total` or `vendor`/`amount`.

```json
{
  "eventType": "burp",
  "receipt": { "merchant": "Corner Store", "total": 24.75, "category": "groceries" }
}
```

Omit `eventType` for a receipt-only event. A previously created PhoneBurp `burpEvent` may be supplied instead of `receipt`. For `eventType: "artifact"`, include an `artifact` object with a `name` and a `receipt` or `burpEvent`; for `eventType: "identity"`, include an `identity` object and a `receipt` or `burpEvent`. Either optional object may accompany a burp event. The pipeline does not claim true artifact verification: CollectorCheck currently provides `verification: { "status": "placeholder", "verified": false }`.

### External node ingress

`POST /external/ingest` uses the same receipt or BurpEvent contract but requires a nonempty `sourceNode`. Remote identities and artifacts retain their supplied string IDs. When provided, `provenance` must be an array of steps with nonempty `actor` and `action`, optional valid `timestamp`, and an optional object `payload`. Steps may also be supplied as `artifact.provenance` when no top-level `provenance` is present.

```json
{
  "sourceNode": "remote-west",
  "eventType": "artifact",
  "receipt": { "merchant": "Corner Store", "total": 24.75 },
  "identity": { "id": "person-1", "name": "Example Household" },
  "artifact": { "id": "receipt-1", "name": "Receipt scan" },
  "provenance": [{ "actor": "remote-agent", "action": "scanned", "timestamp": "2026-10-01T12:00:00Z", "payload": { "ref": "A-1" } }]
}
```

The archive keeps these steps with the source node, and Ditto binds them to the identity. Dadtabus records the source node in the continuity token. This is an ingestion trail, not independent verification or authentication of the remote node; CollectorCheck still reports `verified: false`. Expose this endpoint only behind an authenticated gateway when accepting events from outside the machine.

`runtimeConfig.js` loads a repository-root `.env` when present, then applies defaults and any explicit environment overrides. It reads `NODE_ENV`, `LOG_LEVEL` (`off` disables logging), `CONTINUITY_LOGGING` (`false` disables logging), `PERSISTENCE_MODE` or `CONTINUITY_PERSISTENCE` (`memory` or `file`), `CONTINUITY_STATE_FILE` (defaults to a file in the user's home directory), `CONTINUITY_PIPELINE_MODE` (`synchronous`), and `PORT_RUNTIME` or `PORT`. Unsupported modes fail at startup. File mode writes dispatched event records to `deploy/data/runtime-events.json` and complete run snapshots to `CONTINUITY_STATE_FILE` before acknowledging ingests, but does not reload ledgers into new requests. `continuityLog.js` provides `logEvent`, `getLogs`, and `clearLogs`; file mode uses JSON lines in `deploy/logs/runtime.log` (overridable via `CONTINUITY_LOG_FILE`), while memory mode retains in-process logs. Logs are not exposed via HTTP.