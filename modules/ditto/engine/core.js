const db = require("../../../continuity-engine/persistence/db");

module.exports = {
    init() {
        const data = db.load();
        if (!data.identity) data.identity = {};
        db.save(data);
        return "ditto ready";
    },

    bind(userId, payload) {
        const data = db.load();
        if (!data.identity) data.identity = {};
            data.identity[userId] = {
                ...(payload || {}),
                boundAt: Date.now()
            };
        db.save(data);
        return { bound: true };
    },

    get(userId) {
        const data = db.load();
        return data.identity?.[userId] || {};
    }
};
