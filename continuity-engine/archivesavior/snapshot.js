function createSnapshot(type, payload = {}) {
    if (typeof type !== "string" || !type.trim()) {
        throw new TypeError("A snapshot type is required.");
    }

    return {
        timestamp: Date.now(),
        type: type.trim(),
        payload
    };
}

module.exports = { createSnapshot };