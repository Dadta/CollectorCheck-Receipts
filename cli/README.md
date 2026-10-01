# Continuity Engine CLI

Run commands from the repository root with `node cli/ce.js`. The CLI calls the PhoneBurp engine and Ditto identity classes locally, uses the runtime dispatcher to run the full pipeline, and reads module health from the runtime server when available. It does not require the runtime server for `burp`, `identity`, `ledger`, `archive`, or `pipeline`.

| Command | Action |
| --- | --- |
| `node cli/ce.js burp receipt.json` | Parse a receipt and print BurpPoints and its event summary. |
| `node cli/ce.js verify artifact.json` | POST the artifact to CollectorCheck's `/verify` route and print its response. |
| `node cli/ce.js identity identity.json` | Bind a Ditto identity locally and print its continuity summary. |
| `node cli/ce.js ledger` | Print saved Dadtabus entries, balance, and continuity tokens. |
| `node cli/ce.js archive <artifactId>` | Print a saved archive's provenance chain and snapshots. |
| `node cli/ce.js pipeline receipt.json` | Run PhoneBurp through the continuity pipeline and print the final CLI ledger plus the artifact and archive IDs. |
| `node cli/ce.js status` | Print runtime health and the seven-module registry; report `offline` if the server is unavailable. |

Example receipt (`receipt.json`):

```json
{ "merchant": "Corner Store", "total": 24.75, "category": "groceries" }
```

Example artifact (`artifact.json`):

```json
{ "name": "Purchase evidence", "description": "Receipt scan" }
```

Example identity (`identity.json`):

```json
{ "name": "Example Household" }
```

`pipeline` prints an `artifactId`; use that value with `archive`. Pipeline runs save their ledger entries and archives in `~/.continuity-engine-cli.json` so later CLI processes can query them. Set `CE_STATE_FILE` to a different file path to isolate runs. Only pipeline runs add to that snapshot; `burp` and `identity` are standalone previews. The CLI snapshot is separate from the runtime's per-request in-memory ledger and should be protected like other local household data.

To run `status` against the runtime, start `node runtime/runtimeServer.js`; override its URL with `CONTINUITY_RUNTIME_URL`. `verify` requires a running CollectorCheck HTTP service: start it on port 4002 with `PORT=4002 node continuity-engine/collectorcheck/server.js` (set `PORT` in your shell on Windows), or set `COLLECTORCHECK_URL` to its base URL. CollectorCheck currently returns placeholder verification with `verified: false`, and its route writes artifacts to the engine persistence store. CLI `status` only reports local module loadability when the runtime is offline.