const UTILITY_TYPES = ["power", "water", "connectivity"];

function identifyUtility(account) {
    const label = String(account.utilityType || account.utility || account.type || account.provider || "").toLowerCase();
    if (/power|electric|energy|electricity/.test(label)) return "power";
    if (/water/.test(label)) return "water";
    if (/connect|internet|broadband|telecom|phone/.test(label)) return "connectivity";
    return null;
}

function riskPenalty(risk) {
    if (typeof risk === "number" && Number.isFinite(risk)) {
        return Math.round(Math.max(0, Math.min(1, risk)) * 20);
    }
    switch (String(risk || "").toLowerCase()) {
        case "critical":
        case "high":
            return 15;
        case "medium":
        case "moderate":
            return 8;
        case "low":
            return 0;
        default:
            return 5;
    }
}

function utilityScore(account) {
    if (!account) return 0;
    const status = String(account.status || "unknown").toLowerCase();
    if (["outage", "disconnected", "inactive", "suspended"].includes(status)) return 0;

    const availability = ["active", "connected", "current"].includes(status) ? 20 : 12;
    return Math.max(0, availability - riskPenalty(account.continuityRisk));
}

function calculateDignityIndex(householdLedger, continuityProfile) {
    if (!householdLedger || typeof householdLedger !== "object") {
        throw new TypeError("A household ledger is required.");
    }

    const utilities = Array.isArray(householdLedger.utilities) ? householdLedger.utilities : [];
    const events = Array.isArray(householdLedger.continuityEvents) ? householdLedger.continuityEvents : [];
    const utilityBreakdown = Object.fromEntries(UTILITY_TYPES.map(type => {
        const account = utilities.find(item => identifyUtility(item) === type);
        return [type, {
            score: utilityScore(account),
            maximum: 20,
            status: account?.status ?? "missing",
            continuityRisk: account?.continuityRisk ?? "untracked",
            accountPresent: Boolean(account)
        }];
    }));
    const utilityPoints = Object.values(utilityBreakdown).reduce((total, item) => total + item.score, 0);

    const profileScoreValue = typeof continuityProfile?.continuityScore === "number"
        ? continuityProfile.continuityScore
        : continuityProfile?.continuityScore?.score;
    const normalizedProfileScore = Number.isFinite(profileScoreValue)
        ? Math.max(0, Math.min(100, profileScoreValue))
        : 0;
    const identityPoints = Math.round(normalizedProfileScore * 0.3);
    const eventPoints = Math.min(10, events.length * 2);
    const score = utilityPoints + identityPoints + eventPoints;

    return {
        score,
        maximum: 100,
        rating: score >= 80 ? "supported" : score >= 60 ? "developing" : score >= 35 ? "vulnerable" : "at-risk",
        explanation: {
            summary: `Household dignity index is ${score}/100, based on utility continuity, identity continuity, and documented events.`,
            components: {
                utilityContinuity: { score: utilityPoints, maximum: 60, utilities: utilityBreakdown },
                identityContinuity: {
                    score: identityPoints,
                    maximum: 30,
                    sourceScore: Number.isFinite(profileScoreValue) ? profileScoreValue : null
                },
                documentedEvents: { score: eventPoints, maximum: 10, eventCount: events.length }
            },
            gaps: UTILITY_TYPES.filter(type => !utilityBreakdown[type].accountPresent)
        }
    };
}

module.exports = { calculateDignityIndex };