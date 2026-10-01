const { getProvenanceMap } = require("./provenanceBinder");

function generateInsuranceDocument(identity) {
    if (!identity || typeof identity !== "object") {
        throw new TypeError("An identity is required.");
    }

    const provenance = Array.isArray(identity.provenance) ? identity.provenance : [];
    const continuityRecords = Array.isArray(identity.continuityRecords) ? identity.continuityRecords : [];
    const provenanceEntryCount = provenance.reduce((count, binding) => {
        if (Array.isArray(binding.provenance)) return count + binding.provenance.length;
        return count + (binding.provenance == null ? 0 : 1);
    }, 0);

    return {
        identitySummary: typeof identity.getContinuitySummary === "function"
            ? identity.getContinuitySummary()
            : {
                id: identity.id,
                name: identity.name || "",
                contact: identity.contact || null,
                totalRecords: continuityRecords.length
            },
        artifactList: provenance.map(binding => ({
            id: binding.artifactId,
            name: binding.artifactName
        })),
        provenanceSummary: {
            artifactCount: provenance.length,
            entryCount: provenanceEntryCount,
            byArtifact: getProvenanceMap(identity)
        },
        continuityLedger: [...continuityRecords]
    };
}

module.exports = { generateInsuranceDocument };