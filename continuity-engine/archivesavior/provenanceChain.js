function createProvenanceStep(actor, action, payload = {}) {
    if (typeof actor !== "string" || !actor.trim()) {
        throw new TypeError("A provenance actor is required.");
    }
    if (typeof action !== "string" || !action.trim()) {
        throw new TypeError("A provenance action is required.");
    }

    return {
        timestamp: Date.now(),
        actor: actor.trim(),
        action: action.trim(),
        payload
    };
}

module.exports = { createProvenanceStep };