# CollectorCheck

CollectorCheck is the artifact verification gateway for the Continuity Engine. It accepts artifact payloads, validates their basic shape, and stores them with provenance and continuity context in the engine's shared persistence store. Verification is currently a placeholder and does not assert authenticity.

CollectorCheck connects to Ditto by carrying the artifact's `continuityRecord` through the shared identity substrate, where identity context can be bound and transported across modules. Once verified workflows are implemented, Dadtabus can route those continuity records to global continuity rails. CollectorCheck remains responsible for artifact and provenance context; Ditto handles identity transport, and Dadtabus handles global routing.

## API

- `GET /health` reports that the service is available.
- `POST /verify` accepts an artifact JSON object with a non-empty `name`, stores it, and returns a placeholder verification result.

Run the standalone service with `node continuity-engine/collectorcheck/server.js`. It listens on port `4001` by default; set `PORT` to override it.