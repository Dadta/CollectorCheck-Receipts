function bindProvenance(identity, artifact) {
    if (!identity || typeof identity !== "object") {
        throw new TypeError("An identity is required.");
    }
    if (!artifact || typeof artifact !== "object" || artifact.id === undefined || artifact.id === null) {
        throw new TypeError("An artifact with an id is required.");
    }
    if (!Array.isArray(identity.provenance)) identity.provenance = [];

    const binding = {
        artifactId: artifact.id,
        artifactName: artifact.name || null,
        provenance: artifact.provenance ?? [],
        boundAt: Date.now()
    };
    const existingIndex = identity.provenance.findIndex(
        entry => String(entry.artifactId) === String(artifact.id)
    );

    if (existingIndex === -1) identity.provenance.push(binding);
    else identity.provenance[existingIndex] = binding;

    return binding;
}

function getProvenanceMap(identity) {
    if (!identity || typeof identity !== "object") {
        throw new TypeError("An identity is required.");
    }

    return Object.fromEntries((identity.provenance || []).map(entry => [
        String(entry.artifactId),
        entry.provenance
    ]));
}

module.exports = { bindProvenance, getProvenanceMap };