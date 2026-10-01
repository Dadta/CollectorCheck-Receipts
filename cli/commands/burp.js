const fs = require("node:fs");
const BurpEngine = require("../../continuity-engine/phoneburp/burpEngine");

function burp(file) {
    const receipt = JSON.parse(fs.readFileSync(file, "utf8"));
    const event = new BurpEngine().ingestReceipt(receipt);
    return {
        burpPoints: event.points,
        event: {
            id: event.id,
            type: event.type,
            merchant: event.receipt.merchant,
            total: event.receipt.total,
            category: event.receipt.category,
            timestamp: event.timestamp
        }
    };
}

module.exports = burp;