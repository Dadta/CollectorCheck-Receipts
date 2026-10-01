const BurpEngine = require("../continuity-engine/phoneburp/burpEngine");
const Artifact = require("../continuity-engine/collectorcheck/models/artifact");
const Identity = require("../continuity-engine/ditto/identity");
const ContinuityOrchestrator = require("../pipeline/orchestrator");

class ContinuityDispatcher {
    dispatchBurpEvent(payload) {
        return this.dispatch(payload);
    }

    dispatchArtifactEvent(payload) {
        if (!payload?.artifact || typeof payload.artifact.name !== "string" || !payload.artifact.name.trim()) {
            throw new TypeError("An artifact with a name is required.");
        }
        return this.dispatch(payload);
    }

    dispatchIdentityEvent(payload) {
        if (!payload?.identity || typeof payload.identity !== "object" || Array.isArray(payload.identity)) {
            throw new TypeError("An identity object is required.");
        }
        return this.dispatch(payload);
    }

    dispatch(payload) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            throw new TypeError("A continuity payload is required.");
        }

        const burpEvent = payload.burpEvent ?? new BurpEngine().ingestReceipt(payload.receipt ?? payload);
        const orchestrator = new ContinuityOrchestrator();
        if (payload.identity) {
            orchestrator.bindIdentity(new Identity(payload.identity));
        }
        if (payload.artifact) {
            if (typeof payload.artifact.name !== "string" || !payload.artifact.name.trim()) {
                throw new TypeError("An artifact with a name is required.");
            }
            orchestrator.bindArtifact(new Artifact(payload.artifact));
        }
        return orchestrator.runPipeline(burpEvent);
    }
}

module.exports = ContinuityDispatcher;