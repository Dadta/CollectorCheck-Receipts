function validateBurpEvent(burpEvent) {
    if (!burpEvent || typeof burpEvent !== "object" || !burpEvent.id || !Number.isSafeInteger(burpEvent.points) || burpEvent.points < 0) {
        throw new TypeError("A BurpEvent with an id and non-negative integer points is required.");
    }
}

function bindBurpToIdentity(identity, burpEvent) {
    if (!identity || typeof identity.attachRecord !== "function") {
        throw new TypeError("A Ditto identity with attachRecord is required.");
    }
    validateBurpEvent(burpEvent);
    return identity.attachRecord({
        id: burpEvent.id,
        type: "phoneburp",
        burpEventId: burpEvent.id,
        points: burpEvent.points,
        timestamp: burpEvent.timestamp
    });
}

function bindBurpToLedger(ledger, burpEvent) {
    if (!ledger || typeof ledger.addEntry !== "function") {
        throw new TypeError("A Dadtabus ledger with addEntry is required.");
    }
    validateBurpEvent(burpEvent);
    return ledger.addEntry({
        type: "credit",
        source: "phoneburp",
        burpEventId: burpEvent.id,
        amount: burpEvent.points,
        timestamp: burpEvent.timestamp
    });
}

module.exports = { bindBurpToIdentity, bindBurpToLedger };