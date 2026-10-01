const db = require("../../../continuity-engine/persistence/db");

module.exports = {
    init() {
        const data = db.load();
        db.ensureCollection(data, "artifacts");
        db.ensureCollection(data, "provenance");
        db.save(data);
        return "collectorcheck ready";
    },

    storeArtifact(artifact) {
        const data = db.load();
        db.ensureCollection(data, "artifacts");
        db.ensureCollection(data, "provenance");
        const source = artifact || {};
        const timestamp = Date.now();

        const entry = {
            id: timestamp,
            name: source.name,
            type: source.type,
            estimatedValue: source.estimatedValue || 0,
            age: source.age || 0,
            timestamp
        };

        data.artifacts.push(entry);
        data.provenance.push({
            artifactId: entry.id,
            timestamp: Date.now(),
            event: "added",
            details: entry
        });

        db.save(data);
        return entry;
    },

    getProvenance() {
        const data = db.load();
        return data.provenance || [];
    }
};
