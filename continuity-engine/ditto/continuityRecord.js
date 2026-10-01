const { randomUUID } = require("crypto");

function createContinuityRecord({ id = randomUUID(), timestamp = Date.now(), type, payload = {} } = {}) {
    if (typeof type !== "string" || !type.trim()) {
        throw new TypeError("A continuity record type is required.");
    }

    return { id, timestamp, type: type.trim(), payload };
}

module.exports = { createContinuityRecord };