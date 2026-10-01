const db = require("../../../continuity-engine/persistence/db");

module.exports = {
    init() {
        const data = db.load();
        db.ensureCollection(data, "household");
        db.save(data);
        return "hydrofrenzy ready";
    },

    scanSticker(sticker) {
        const data = db.load();
        db.ensureCollection(data, "household");
        const source = sticker || {};
        const entry = {
            id: Date.now(),
            provider: source.provider || "Unknown",
            amount: source.amount || 0,
            timestamp: Date.now()
        };
        data.household.push(entry);
        db.save(data);
        return entry;
    },

    getHousehold() {
        const data = db.load();
        return data.household || [];
    },

    dignityScore() {
        const data = db.load();
        const bills = data.household || [];
        return bills.length * 2;
    }
};
