const db = require("../../persistence/db");

function loadRecords() {
    const data = db.load();
    if (!Array.isArray(data.artifacts)) data.artifacts = [];
    return { data, records: data.artifacts };
}

function readRecord(id) {
    const { records } = loadRecords();
    return records.find(record => String(record.id) === String(id)) || null;
}

function writeRecord(record) {
    if (!record || typeof record !== "object" || record.id === undefined || record.id === null) {
        throw new TypeError("A record with an id is required.");
    }

    const { data, records } = loadRecords();
    if (records.some(existing => String(existing.id) === String(record.id))) {
        const error = new Error("A record with this id already exists.");
        error.code = "ARTIFACT_EXISTS";
        throw error;
    }

    records.push(record);
    db.save(data);
    return record;
}

function updateRecord(id, updates) {
    const { data, records } = loadRecords();
    const record = records.find(existing => String(existing.id) === String(id));
    if (!record) return null;

    Object.assign(record, updates, { id: record.id });
    db.save(data);
    return record;
}

function deleteRecord(id) {
    const { data, records } = loadRecords();
    const index = records.findIndex(record => String(record.id) === String(id));
    if (index === -1) return false;

    records.splice(index, 1);
    db.save(data);
    return true;
}

module.exports = { readRecord, writeRecord, updateRecord, deleteRecord };