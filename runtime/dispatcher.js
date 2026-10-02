const BurpEngine = require("../continuity-engine/phoneburp/burpEngine");
const Artifact = require("../continuity-engine/collectorcheck/models/artifact");
const Identity = require("../continuity-engine/ditto/identity");
const ContinuityOrchestrator = require("../pipeline/orchestrator");
const { loadConfig } = require("./runtimeConfig");
const { writeEvent } = require("./persistence/fileStore");

function dispatchError(code, cause) {
    const error = new Error(cause.message, { cause });
    error.code = code;
    error.status = code === "E_PIPELINE_FAIL" ? 500 : 400;
    return error;
}

class ContinuityDispatcher {
    constructor(config = loadConfig()) {
        this.persistenceMode = config.persistenceMode;
        this.eventFile = config.eventFile;
        this.queue = Promise.resolve();
        this.pending = 0;
        this.busy = false;
        this.eventCount = 0;
        this.lastEventTimestamp = null;
    }

    dispatchQueued(payload, type = "burp") {
        const receivedAt = Date.now();
        this.pending++;
        const task = this.queue.then(() => {
            this.busy = true;
            try {
                return this.dispatch(payload, type, receivedAt);
            } finally {
                this.busy = false;
                this.pending--;
            }
        });
        this.queue = task.then(() => {}, () => {});
        return task;
    }

    dispatchBurpEvent(payload) {
        return this.dispatch(payload, "burp");
    }

    dispatchArtifactEvent(payload) {
        return this.dispatch(payload, "artifact");
    }

    dispatchIdentityEvent(payload) {
        return this.dispatch(payload, "identity");
    }

    dispatch(payload, type = "burp", receivedAt = Date.now()) {
        if (!["burp", "artifact", "identity"].includes(type)) {
            throw dispatchError("E_INGEST_FAIL", new TypeError("Unknown continuity event type."));
        }
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            throw dispatchError("E_INGEST_FAIL", new TypeError("A continuity payload is required."));
        }
        if (payload.sourceNode !== undefined && (typeof payload.sourceNode !== "string" || !payload.sourceNode.trim())) {
            throw dispatchError("E_INGEST_FAIL", new TypeError("A sourceNode must be a nonempty string."));
        }
        if (type === "artifact" && (typeof payload.artifact?.name !== "string" || !payload.artifact.name.trim())) {
            throw dispatchError("E_INGEST_FAIL", new TypeError("An artifact with a name is required."));
        }
        if (type === "identity" && (!payload.identity || typeof payload.identity !== "object" || Array.isArray(payload.identity))) {
            throw dispatchError("E_IDENTITY_FAIL", new TypeError("An identity object is required."));
        }
        if (payload.sourceNode && payload.identity && (typeof payload.identity.id !== "string" || !payload.identity.id.trim())) {
            throw dispatchError("E_IDENTITY_FAIL", new TypeError("A remote identity requires an id."));
        }
        if (payload.sourceNode && payload.artifact && (typeof payload.artifact.id !== "string" || !payload.artifact.id.trim())) {
            throw dispatchError("E_INGEST_FAIL", new TypeError("A remote artifact requires an id."));
        }

        let burpEvent;
        try {
            burpEvent = payload.burpEvent ?? new BurpEngine().ingestReceipt(payload.receipt ?? payload);
        } catch (error) {
            throw dispatchError("E_INGEST_FAIL", error);
        }
        const orchestrator = new ContinuityOrchestrator();
        if (payload.identity) {
            try {
                orchestrator.bindIdentity(new Identity(payload.identity));
            } catch (error) {
                throw dispatchError("E_IDENTITY_FAIL", error);
            }
        }
        if (payload.artifact) {
            if (typeof payload.artifact.name !== "string" || !payload.artifact.name.trim()) {
                throw dispatchError("E_INGEST_FAIL", new TypeError("An artifact with a name is required."));
            }
            orchestrator.bindArtifact(new Artifact(payload.artifact));
        }
        const provenance = payload.provenance ?? payload.artifact?.provenance;
        if (payload.sourceNode && provenance !== undefined) {
            try {
                orchestrator.bindProvenance(provenance, payload.sourceNode.trim());
            } catch (error) {
                throw dispatchError("E_INGEST_FAIL", error);
            }
        }
        try {
            const result = orchestrator.runPipeline(burpEvent, { sourceNode: payload.sourceNode?.trim() ?? null });
            const timestamp = Date.now();
            result.dispatch = { type, receivedAt, completedAt: timestamp };
            if (payload.sourceNode) result.dispatch.sourceNode = payload.sourceNode.trim();
            if (this.persistenceMode === "file") {
                writeEvent({
                    type,
                    timestamp,
                    receivedAt,
                    sourceNode: result.dispatch.sourceNode ?? null,
                    burpEvent: result.burpEvent,
                    artifactId: result.artifact.id,
                    identityId: result.identity.id,
                    tokenId: result.token.id
                }, this.eventFile);
            }
            this.eventCount++;
            this.lastEventTimestamp = timestamp;
            return result;
        } catch (error) {
            throw dispatchError("E_PIPELINE_FAIL", error);
        }
    }
}

module.exports = ContinuityDispatcher;