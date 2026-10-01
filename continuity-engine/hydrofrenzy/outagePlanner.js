const PLANS = {
    power: [
        ["before", "Charge phones, battery packs, and essential medical devices."],
        ["during", "Use safe backup lighting and keep refrigerator doors closed."],
        ["after", "Check appliances and report damage or extended service interruption."]
    ],
    water: [
        ["before", "Store drinking water and identify the household shutoff valve."],
        ["during", "Use stored water for essential needs and follow local safety notices."],
        ["after", "Follow boil-water guidance and check for leaks before normal use."]
    ],
    connectivity: [
        ["before", "Save essential contacts and identify an alternate way to receive alerts."],
        ["during", "Use available backup connectivity and share status through a safe channel."],
        ["after", "Confirm service restoration and sync any offline continuity records."]
    ]
};

function identifyUtility(account) {
    const label = String(account.utilityType || account.utility || account.type || account.provider || "").toLowerCase();
    if (/power|electric|energy|electricity/.test(label)) return "power";
    if (/water/.test(label)) return "water";
    if (/connect|internet|broadband|telecom|phone/.test(label)) return "connectivity";
    return null;
}

function generateOutagePlan(householdLedger) {
    if (!householdLedger || typeof householdLedger !== "object") {
        throw new TypeError("A household ledger is required.");
    }

    const utilities = Array.isArray(householdLedger.utilities) ? householdLedger.utilities : [];
    return {
        householdId: householdLedger.householdId ?? null,
        generatedAt: Date.now(),
        utilities: Object.fromEntries(Object.entries(PLANS).map(([type, steps]) => {
            const account = utilities.find(item => identifyUtility(item) === type) || null;
            return [type, {
                provider: account?.provider ?? null,
                status: account?.status ?? "untracked",
                steps: steps.map(([phase, action]) => ({ phase, action }))
            }];
        }))
    };
}

module.exports = { generateOutagePlan };