const db = require("./persistence/db");

module.exports = {
    bindIdentity(userId, payload) {
        const data = db.load();
        if (!data.identity) data.identity = {};
        data.identity[userId] = payload;
        db.save(data);
        return { userId, bound: true };
    },
    getIdentity(userId) {
        const data = db.load();
        return data.identity?.[userId] || {};
    }
};
