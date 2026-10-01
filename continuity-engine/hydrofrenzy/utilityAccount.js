function createUtilityAccount(payload = {}) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new TypeError("Utility account payload must be an object.");
    }
    if (typeof payload.provider !== "string" || !payload.provider.trim()) {
        throw new TypeError("A utility provider is required.");
    }

    return {
        provider: payload.provider.trim(),
        accountNumber: payload.accountNumber ?? null,
        status: payload.status ?? "unknown",
        continuityRisk: payload.continuityRisk ?? "unknown",
        utilityType: payload.utilityType ?? payload.utility ?? payload.type ?? null
    };
}

module.exports = { createUtilityAccount };