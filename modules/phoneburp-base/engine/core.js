const db = require("../../../continuity-engine/persistence/db");

module.exports = {
    init() {
        const data = db.load();
        db.ensureCollection(data, "receipts");
        db.save(data);
        return "phoneburp-base ready";
    },

    ingest(receipt) {
        const data = db.load();
        db.ensureCollection(data, "receipts");
        const source = receipt || {};
        const timestamp = Date.now();
        const entry = {
            id: timestamp,
            vendor: source.vendor || "Unknown Vendor",
            amount: source.amount || 0,
            category: "uncategorized",
            timestamp
        };
        data.receipts.push(entry);
        db.save(data);
        return entry;
    },

    burp() {
        return {
            burped: true,
            continuityEvent: "receipt_ingested",
            timestamp: Date.now()
        };
    },

    getReceipts() {
        const data = db.load();
        return data.receipts || [];
    }
};
