const { randomUUID } = require("crypto");

class HouseholdLedger {
    constructor({ id = randomUUID(), householdId = null, utilities = [], continuityEvents = [] } = {}) {
        this.id = id;
        this.householdId = householdId;
        this.utilities = Array.isArray(utilities) ? [...utilities] : [];
        this.continuityEvents = Array.isArray(continuityEvents) ? [...continuityEvents] : [];
    }

    addUtility(utility) {
        if (!utility || typeof utility !== "object" || Array.isArray(utility)) {
            throw new TypeError("A utility account object is required.");
        }

        this.utilities.push(utility);
        return utility;
    }

    recordEvent(event) {
        if (!event || typeof event !== "object" || Array.isArray(event)) {
            throw new TypeError("A continuity event object is required.");
        }

        const recordedEvent = { timestamp: Date.now(), ...event };
        this.continuityEvents.push(recordedEvent);
        return recordedEvent;
    }

    getHouseholdSummary() {
        return {
            id: this.id,
            householdId: this.householdId,
            utilityCount: this.utilities.length,
            continuityEventCount: this.continuityEvents.length,
            utilitiesByStatus: this.utilities.reduce((summary, utility) => {
                const status = String(utility.status || "unknown").toLowerCase();
                summary[status] = (summary[status] || 0) + 1;
                return summary;
            }, {})
        };
    }
}

module.exports = HouseholdLedger;