function createHouseholdContext(payload = {}) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new TypeError("Household context payload must be an object.");
    }

    return {
        address: payload.address ?? null,
        occupants: Array.isArray(payload.occupants) ? [...payload.occupants] : [],
        assets: Array.isArray(payload.assets) ? [...payload.assets] : [],
        continuityFactors: Array.isArray(payload.continuityFactors) ? [...payload.continuityFactors] : []
    };
}

module.exports = { createHouseholdContext };