const fs = require("node:fs");
const path = require("node:path");

function readRuns(stateFile) {
    if (!fs.existsSync(stateFile)) return [];
    const runs = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    if (!Array.isArray(runs)) throw new TypeError("Invalid runtime state file.");
    return runs;
}

function appendRun(stateFile, result) {
    const runs = readRuns(stateFile);
    runs.push({
        recordedAt: Date.now(),
        burpEvent: result.burpEvent,
        profile: result.profile.getProfileSummary(),
        dignityIndex: result.dignityIndex,
        archive: result.archive,
        artifact: result.artifact,
        verification: result.verification,
        identity: result.identity,
        token: result.token,
        entry: result.entry
    });
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    const temporary = `${stateFile}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(runs, null, 2), { mode: 0o600 });
    fs.renameSync(temporary, stateFile);
    return runs.length;
}

module.exports = { readRuns, appendRun };