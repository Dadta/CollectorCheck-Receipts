const { randomUUID } = require("crypto");
const { evaluateContinuity } = require("./continuityEvaluator");

class ContinuityProfile {
    constructor({
        id = randomUUID(),
        identityId = null,
        riskProfile = {},
        continuityScore = null,
        householdContext = null
    } = {}) {
        this.id = id;
        this.identityId = identityId;
        this.riskProfile = riskProfile && typeof riskProfile === "object" ? { ...riskProfile } : {};
        this.continuityScore = continuityScore;
        this.householdContext = householdContext;
    }

    updateRiskProfile(riskProfile) {
        if (!riskProfile || typeof riskProfile !== "object" || Array.isArray(riskProfile)) {
            throw new TypeError("Risk profile updates must be an object.");
        }

        this.riskProfile = { ...this.riskProfile, ...riskProfile };
        return this.riskProfile;
    }

    recalculateContinuityScore(identity = null, archives = []) {
        const sourceIdentity = identity || { id: this.identityId, continuityRecords: [] };
        if (this.identityId === null && sourceIdentity.id !== undefined) {
            this.identityId = sourceIdentity.id;
        }
        this.continuityScore = evaluateContinuity(sourceIdentity, this.householdContext, archives);
        return this.continuityScore;
    }

    getProfileSummary() {
        const householdContext = this.householdContext;
        return {
            id: this.id,
            identityId: this.identityId,
            riskProfile: { ...this.riskProfile },
            continuityScore: this.continuityScore,
            householdContext: householdContext ? {
                occupants: Array.isArray(householdContext.occupants) ? householdContext.occupants.length : 0,
                assets: Array.isArray(householdContext.assets) ? householdContext.assets.length : 0,
                continuityFactors: Array.isArray(householdContext.continuityFactors)
                    ? householdContext.continuityFactors.length
                    : 0
            } : null
        };
    }
}

module.exports = ContinuityProfile;