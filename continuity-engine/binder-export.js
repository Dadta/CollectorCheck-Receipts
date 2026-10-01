const db = require("./persistence/db");

module.exports = {
    exportBinder(userId) {
        const data = db.load();
        return {
            userId,
            receipts: data.receipts || [],
            artifacts: data.artifacts || [],
            provenance: data.provenance || [],
            continuityScore: data.scores?.[userId] || 0
        };
    }
};
