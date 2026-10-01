const { loadState } = require("../state");

function archive(artifactId) {
    const match = loadState().archives.findLast(entry => String(entry.artifactId) === artifactId);
    if (!match) throw new Error(`No archive found for artifact ${artifactId}.`);
    return {
        id: match.id,
        artifactId: match.artifactId,
        provenanceChain: match.provenanceChain,
        continuitySnapshots: match.continuitySnapshots
    };
}

module.exports = archive;