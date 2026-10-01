function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function evaluateContinuity(identity, householdContext, archives) {
    const continuityRecords = asArray(identity?.continuityRecords);
    const archiveList = Array.isArray(archives) ? archives : archives ? [archives] : [];
    const occupants = asArray(householdContext?.occupants);
    const assets = asArray(householdContext?.assets);
    const continuityFactors = asArray(householdContext?.continuityFactors);

    const identityPoints = Math.min(30, (identity?.id ? 10 : 0) + Math.min(20, continuityRecords.length * 4));
    const householdPoints = householdContext ? 10
        + Math.min(10, occupants.length * 2)
        + Math.min(5, assets.length)
        + Math.min(5, continuityFactors.length) : 0;

    const provenanceSteps = archiveList.reduce((count, archive) => count + asArray(archive?.provenanceChain).length, 0);
    const continuitySnapshots = archiveList.reduce((count, archive) => count + asArray(archive?.continuitySnapshots).length, 0);
    const archivePoints = Math.min(15, archiveList.length * 5)
        + Math.min(15, provenanceSteps * 3)
        + Math.min(10, continuitySnapshots * 2);
    const score = identityPoints + householdPoints + archivePoints;

    return {
        score,
        maximum: 100,
        rating: score >= 80 ? "strong" : score >= 60 ? "developing" : score >= 40 ? "fragile" : "critical",
        identityId: identity?.id ?? null,
        evaluatedAt: Date.now(),
        breakdown: {
            identity: { score: identityPoints, maximum: 30, continuityRecords: continuityRecords.length },
            household: {
                score: householdPoints,
                maximum: 30,
                occupants: occupants.length,
                assets: assets.length,
                continuityFactors: continuityFactors.length
            },
            archives: {
                score: archivePoints,
                maximum: 40,
                archiveCount: archiveList.length,
                provenanceSteps,
                continuitySnapshots
            }
        }
    };
}

module.exports = { evaluateContinuity };