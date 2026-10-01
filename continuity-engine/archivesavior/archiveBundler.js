function bundleArchive(archive) {
    if (!archive || typeof archive !== "object") {
        throw new TypeError("An archive is required.");
    }

    const provenanceChain = Array.isArray(archive.provenanceChain) ? archive.provenanceChain : [];
    const continuitySnapshots = Array.isArray(archive.continuitySnapshots) ? archive.continuitySnapshots : [];

    return {
        format: "continuity-archive",
        bundledAt: Date.now(),
        archive: {
            id: archive.id,
            artifactId: archive.artifactId ?? null,
            identityId: archive.identityId ?? null,
            provenanceChain: provenanceChain.map(step => ({ ...step })),
            continuitySnapshots: continuitySnapshots.map(snapshot => ({ ...snapshot }))
        },
        summary: typeof archive.getArchiveSummary === "function"
            ? archive.getArchiveSummary()
            : {
                id: archive.id,
                artifactId: archive.artifactId ?? null,
                identityId: archive.identityId ?? null,
                provenanceSteps: provenanceChain.length,
                continuitySnapshots: continuitySnapshots.length
            }
    };
}

function exportBundle(archiveBundle) {
    if (!archiveBundle || typeof archiveBundle !== "object" || Array.isArray(archiveBundle)) {
        throw new TypeError("An archive bundle object is required.");
    }

    return JSON.stringify(archiveBundle, null, 2);
}

module.exports = { bundleArchive, exportBundle };