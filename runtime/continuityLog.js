const logs = [];

function logEvent(event) {
    if (!event || typeof event !== "object" || Array.isArray(event) || !event.type) {
        throw new TypeError("A continuity log event with a type is required.");
    }
    const entry = { timestamp: Date.now(), ...event };
    logs.push(entry);
    return { ...entry };
}

function getLogs() {
    return logs.map(entry => ({ ...entry }));
}

function clearLogs() {
    logs.length = 0;
}

module.exports = { logEvent, getLogs, clearLogs };