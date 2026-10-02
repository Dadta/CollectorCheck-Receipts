# Continuity Engine Deployment

This layer starts the HTTP runtime and web dashboard, describes their endpoints, and periodically logs module health. Both launchers bind to `127.0.0.1`; use an authenticated TLS reverse proxy if access beyond this machine is required. The runtime and dashboard are separate processes. Dashboard activity stays in that process and does not automatically display runs ingested by the runtime service.

## Start the services

Install dependencies with `npm --prefix continuity-engine install` (including `dotenv`). Place configuration in a repository-root `.env` file (start with `deploy/env.example`); existing process environment variables take precedence. Open separate terminals in the repository root:

```powershell
node deploy/startRuntime.js
```

```powershell
node deploy/startDashboard.js
```

Runtime status: `http://127.0.0.1:4000/continuity/status`. Dashboard: `http://127.0.0.1:4100/`. Use a private environment file for real deployments; the example contains no credentials. `node deploy/buildDashboard.js` copies templates and static assets into ignored `deploy/dist/dashboard/` for packaging. This is an asset snapshot, not a standalone executable bundle; keep the repository's runtime and dashboard code with it. The dashboard launcher serves source assets.

Run `node activation.js` to check both services on ports 5001 and 5002. It overrides persistence to `memory` for the test requests, prints the ledger, logs, and archive summary, and shuts down without writing to production state, event, or log files.

| Variable | Default in example | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `production` | Banner and runtime environment. |
| `PORT_RUNTIME` | `4000` | Runtime HTTP port. |
| `PORT_DASHBOARD` | `4100` | Dashboard HTTP port. |
| `PERSISTENCE_MODE` | `file` | `file` or `memory` for runtime ingest. |
| `LOG_LEVEL` | `info` | `off` disables logging and the health monitor; other values enable them. |
| `CONTINUITY_STATE_FILE` | User home `~/.continuity-runtime.json` | Private path to the completed-run JSON file in file mode. |
| `CONTINUITY_LOG_FILE` | `deploy/logs/runtime.log` | Optional override for JSON-line logs in file mode. |

File mode writes dispatched event records to `deploy/data/runtime-events.json`, atomically writes complete runtime run snapshots before acknowledging an ingest, and appends event and health logs to `deploy/logs/runtime.log`. It validates existing run JSON at startup. It does not merge concurrent writers to the same state or event file, reload live ledgers between requests, or populate the separate dashboard. Run one runtime writer per state file and back up and protect state, event, and log files as household data. `healthMonitor.js` checks module entry points every 30 seconds; it does not probe external dependencies. `deployManifest.json` lists services, ports, modules, and health endpoints. Neither service provides authentication or TLS, so keep both on localhost behind a controlled proxy.

## Stabilization Mode

Run `node stabilizationTest.js` from the repository root. This starts temporary runtime and dashboard servers in memory mode, sends 10 BurpEvents and 5 receipt pipeline requests concurrently, verifies the 35-point aggregate ledger, queue drain, module health, and stage timing, then closes both servers. The rotation check uses an OS temporary directory. Its guard rejects writes, directory creation, lock-file opens, and renames under `deploy/data/` or `deploy/logs/` before they touch production files.

HTTP ingestion queues requests through one dispatcher so a failed event does not block later events. The synchronous dispatcher API remains available to the CLI and dashboard. Required pipeline stages fail with a coded error; an Archive Savior or CollectorCheck failure produces a partial summary with unavailable verification rather than a false verification claim. `GET /continuity/health` reports each module's status, check time, latency, and errors.

Event-file writes acquire an exclusive `.lock` file, write JSON to a temporary file, and rename it into place. A locked store rejects new writes with `E_FILE_LOCKED`; invalid JSON is moved to a `.corrupt.*` backup before the store is repaired as an empty array. File logs rotate at 1 MB to `runtime.log.1` (one previous file retained) and accept `info`, `warn`, and `error` severity levels. In memory mode, only the latest 500 log entries remain available.