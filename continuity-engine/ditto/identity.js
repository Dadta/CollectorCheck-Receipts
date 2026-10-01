const { randomUUID } = require("crypto");

class Identity {
    constructor({ id = randomUUID(), name = "", contact = null, continuityRecords = [], provenance = [] } = {}) {
        this.id = id;
        this.name = name;
        this.contact = contact;
        this.continuityRecords = Array.isArray(continuityRecords) ? [...continuityRecords] : [];
        this.provenance = Array.isArray(provenance) ? [...provenance] : [];
    }

    attachRecord(record) {
        if (!record || typeof record !== "object" || record.id === undefined || record.id === null) {
            throw new TypeError("A continuity record with an id is required.");
        }

        this.continuityRecords.push(record);
        return record;
    }

    getContinuitySummary() {
        const recordsByType = this.continuityRecords.reduce((summary, record) => {
            const type = record.type || "unspecified";
            summary[type] = (summary[type] || 0) + 1;
            return summary;
        }, {});

        return {
            id: this.id,
            name: this.name,
            contact: this.contact,
            totalRecords: this.continuityRecords.length,
            recordsByType
        };
    }
}

module.exports = Identity;