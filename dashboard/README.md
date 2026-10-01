# Continuity Engine Dashboard

The dashboard is a lightweight server-rendered view of the Continuity Pipeline. It uses the runtime dispatcher, module registry, and continuity log alongside the pipeline flow map. The Pipeline page can run a receipt through all seven modules; that run then appears in the ledger, identity, artifact, and log views. CollectorCheck verification remains a placeholder (`verified: false`).

Install Express if needed with `npm --prefix continuity-engine install`, then run `node dashboard/dashboardServer.js` from the repository root. Open `http://127.0.0.1:4003/`. Set `DASHBOARD_PORT` to use another port. The dashboard can run independently of `runtime/runtimeServer.js`; it imports the same runtime and pipeline modules, rather than querying a separate process.

| Page | Contents |
| --- | --- |
| `/` | Continuity flow map, module health, recent events. |
| `/modules` | Registry with seven modules, version fields, and load checks. |
| `/ledger` | Dadtabus ledger entries, token IDs, and balance from dashboard runs. |
| `/identities`, `/identity/:id` | Identity list and details: CastleFrenzy profile score, Ditto continuity records and provenance bindings. |
| `/artifacts`, `/artifact/:id` | Artifact list and details: verification, archive provenance, snapshots. |
| `/pipeline` | Receipt form, latest pipeline steps, observation timestamps, and detail links. |
| `/logs` | In-process continuity event log. |

Submit a receipt on `/pipeline` to populate the views. Records and logs are in memory and disappear when the dashboard process restarts. This dashboard does not read the CLI's local snapshot or another runtime process's ledger. Timestamps shown for stages without a native timestamp reflect when the full run completed, not a measured per-stage duration. The service is a local development scaffold: it has no authentication, so do not expose it to untrusted networks or enter sensitive household data into a public deployment.