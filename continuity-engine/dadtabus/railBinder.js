const { createToken } = require("./continuityToken");

const ledgerBindings = new WeakMap();

function bindIdentityToLedger(identity, ledger) {
    if (!identity || typeof identity !== "object" || identity.id === undefined || identity.id === null) {
        throw new TypeError("An identity with an id is required.");
    }
    if (!ledger || typeof ledger.addEntry !== "function") {
        throw new TypeError("A ledger with an addEntry method is required.");
    }

    ledgerBindings.set(identity, ledger);
    return { identityId: identity.id, ledgerId: ledger.id ?? null };
}

function recordContinuityEvent(identity, event) {
    if (!identity || typeof identity !== "object") {
        throw new TypeError("An identity is required.");
    }
    if (!event || typeof event !== "object" || Array.isArray(event)) {
        throw new TypeError("A continuity event object is required.");
    }

    const ledger = ledgerBindings.get(identity);
    if (!ledger) throw new Error("Identity is not bound to a continuity ledger.");

    const amount = event.amount === undefined ? 0 : Number(event.amount);
    if (!Number.isFinite(amount)) throw new TypeError("Continuity event amount must be finite.");
    if (typeof identity.attachRecord !== "function" && !Array.isArray(identity.continuityRecords)) {
        throw new TypeError("Identity must support continuity record attachment.");
    }

    const token = createToken(event.sourceModule || "ditto", event.payload ?? event);
    const record = {
        id: token.id,
        timestamp: token.timestamp,
        type: event.type || "continuity-event",
        sourceModule: token.sourceModule,
        payload: token.payload
    };

    const entry = ledger.addEntry({
        ...record,
        amount,
        direction: event.direction
    });

    if (typeof identity.attachRecord === "function") identity.attachRecord(record);
    else identity.continuityRecords.push(record);

    return { token, record, entry };
}

module.exports = { bindIdentityToLedger, recordContinuityEvent };