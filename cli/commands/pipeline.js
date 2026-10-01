const fs = require("node:fs");
const ContinuityDispatcher = require("../../runtime/dispatcher");
const { saveRun } = require("../state");
const ledger = require("./ledger");

function pipeline(file) {
    const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
    const result = new ContinuityDispatcher().dispatchBurpEvent({ receipt });
    saveRun(result);
    return {
        burpEventId: result.burpEvent.id,
        artifactId: result.artifact.id,
        archiveId: result.archive.id,
        verification: result.verification,
        token: result.token,
        ledger: ledger()
    };
}

module.exports = pipeline;