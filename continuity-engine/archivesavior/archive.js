const { randomUUID } = require("crypto");

class Archive {
    constructor({ id = randomUUID(), artifactId = null, identityId = null, provenanceChain = [], continuitySnapshots = [] } = {}) {
        this.id = id;
        this.artifactId = artifactId;
        this.identityId = identityId;
        this.provenanceChain = Array.isArray(provenanceChain) ? [...provenanceChain] : [];
        this.continuitySnapshots = Array.isArray(continuitySnapshots) ? [...continuitySnapshots] : [];
    }

    addProvenanceStep(step) {
        if (!step || typeof step !== "object" || Array.isArray(step)) {
            throw new TypeError("A provenance step object is required.");
        }

        this.provenanceChain.push(step);
        return step;
    }

    addSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new TypeError("A continuity snapshot object is required.");
        }

        this.continuitySnapshots.push(snapshot);
        return snapshot;
    }

    getArchiveSummary() {
        return {
            id: this.id,
            artifactId: this.artifactId,
            identityId: this.identityId,
            provenanceSteps: this.provenanceChain.length,
            continuitySnapshots: this.continuitySnapshots.length,
            latestProvenanceAt: this.provenanceChain.at(-1)?.timestamp ?? null,
            latestSnapshotAt: this.continuitySnapshots.at(-1)?.timestamp ?? null
        };
    }
}

module.exports = Archive;