const db = require("./persistence/db");

module.exports = {
    aggregate() {
        const data = db.load();
        const score = {
            receipts: data.receipts?.length || 0,
            artifacts: data.artifacts?.length || 0,
            household: data.household?.length || 0,
            pufftokens: data.pufftokens?.length || 0,
            identity: data.identity ? Object.keys(data.identity).length : 0
        };
        const total = Object.values(score).reduce((sum, value) => sum + value, 0);

        return { total, breakdown: score };
    }
};
