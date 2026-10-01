const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function statePath() {
    return process.env.CE_STATE_FILE || path.join(os.homedir(), ".continuity-engine-cli.json");
}

function loadState() {
    if (!fs.existsSync(statePath())) return { entries: [], archives: [] };
    const state = JSON.parse(fs.readFileSync(statePath(), "utf8"));
    if (!Array.isArray(state.entries) || !Array.isArray(state.archives)) {
        throw new TypeError("Invalid CLI state file.");
    }
    return state;
}

function saveRun(result) {
    const state = loadState();
    state.entries.push(result.entry);
    state.archives.push({
        id: result.archive.id,
        artifactId: result.archive.artifactId,
        identityId: result.archive.identityId,
        provenanceChain: result.archive.provenanceChain,
        continuitySnapshots: result.archive.continuitySnapshots
    });
    const target = statePath();
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(state, null, 2), { mode: 0o600 });
    fs.renameSync(temporary, target);
    return state;
}

module.exports = { loadState, saveRun };