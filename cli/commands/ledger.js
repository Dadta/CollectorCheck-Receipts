const ContinuityLedger = require("../../continuity-engine/dadtabus/ledger");
const { loadState } = require("../state");

function ledger() {
    const entries = new ContinuityLedger({ entries: loadState().entries }).getEntries();
    return {
        entries,
        balance: new ContinuityLedger({ entries }).getBalance(),
        tokens: entries.filter(entry => entry.sourceModule).map(entry => ({
            id: entry.id,
            timestamp: entry.timestamp,
            sourceModule: entry.sourceModule,
            payload: entry.payload
        }))
    };
}

module.exports = ledger;