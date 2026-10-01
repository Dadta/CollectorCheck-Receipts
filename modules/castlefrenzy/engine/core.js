const db = require("../../../continuity-engine/persistence/db");

module.exports = {
    init() {
        const data = db.load();
        db.ensureCollection(data, "castleRooms");
        db.save(data);
        return "castlefrenzy ready";
    },

    getRooms() {
        const data = db.load();
        return data.castleRooms || [];
    },

    addRoom(name) {
        const data = db.load();
        db.ensureCollection(data, "castleRooms");
        const timestamp = Date.now();
        data.castleRooms.push({
            id: timestamp,
            name,
            created: timestamp
        });
        db.save(data);
        return { added: true };
    }
};
