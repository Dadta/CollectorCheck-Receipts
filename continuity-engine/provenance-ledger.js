const db = require("./persistence/db");

module.exports = {
    recordArtifact(artifact) {
        const data = db.load();
        if (!data.artifacts) data.artifacts = [];
        if (!data.provenance) data.provenance = [];

        data.artifacts.push(artifact);
        data.provenance.push({
            id: artifact.id,
            timestamp: Date.now(),
            details: artifact
        });
        db.save(data);

        return { status: "recorded", artifact };
    },
    getLedger(userId) {
        const data = db.load();
        return data.provenance || [];
    }
};
