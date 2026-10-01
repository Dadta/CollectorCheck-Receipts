const { randomUUID } = require("crypto");

function generatePlan(identity, continuityProfile) {
    if (!identity || typeof identity !== "object" || identity.id === undefined || identity.id === null) {
        throw new TypeError("An identity with an id is required.");
    }
    if (!continuityProfile || typeof continuityProfile !== "object") {
        throw new TypeError("A continuity profile is required.");
    }

    const score = typeof continuityProfile.continuityScore === "number"
        ? continuityProfile.continuityScore
        : continuityProfile.continuityScore?.score;
    const riskLevel = String(continuityProfile.riskProfile?.level || "").toLowerCase();
    const elevatedRisk = riskLevel === "high" || riskLevel === "critical" || (typeof score === "number" && score < 40);
    const priority = elevatedRisk ? "high" : "normal";

    return {
        id: randomUUID(),
        identityId: identity.id,
        profileId: continuityProfile.id ?? null,
        generatedAt: Date.now(),
        phases: {
            "pre-loss": [
                { action: "Review identity and contact details", priority },
                { action: "Capture current household assets and continuity factors", priority },
                { action: "Preserve recent provenance and continuity snapshots", priority }
            ],
            incident: [
                { action: "Record the incident time and affected assets", priority: "urgent" },
                { action: "Notify household occupants and designated contacts", priority: "urgent" },
                { action: "Bind incident evidence to the identity continuity record", priority: "high" }
            ],
            "post-loss": [
                { action: "Reconcile archived provenance against affected assets", priority },
                { action: "Update household context and continuity score", priority },
                { action: "Export the updated continuity record for recovery and claims", priority }
            ]
        }
    };
}

module.exports = { generatePlan };