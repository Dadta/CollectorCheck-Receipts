const fs = require("node:fs");
const Identity = require("../../continuity-engine/ditto/identity");
const ContinuityOrchestrator = require("../../pipeline/orchestrator");

function identity(file) {
    const input = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new TypeError("An identity JSON object is required.");
    }
    const orchestrator = new ContinuityOrchestrator();
    return orchestrator.bindIdentity(new Identity(input)).getContinuitySummary();
}

module.exports = identity;