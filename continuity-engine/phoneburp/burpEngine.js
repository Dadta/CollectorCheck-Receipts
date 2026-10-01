const { randomUUID } = require("crypto");
const { parseReceipt } = require("./receiptParser");
const BurpLedger = require("./burpLedger");

class BurpEngine {
    constructor(ledger = new BurpLedger()) {
        this.ledger = ledger;
    }

    ingestReceipt(payload) {
        const receipt = parseReceipt(payload);
        const points = this.generateBurpPoints(receipt);
        const event = this.createBurpEvent(receipt, points);
        return this.ledger.addEvent(event);
    }

    generateBurpPoints(receipt) {
        if (!receipt || !Number.isFinite(receipt.total) || receipt.total < 0) {
            throw new TypeError("A parsed receipt with a non-negative total is required.");
        }
        return Math.floor(receipt.total);
    }

    createBurpEvent(receipt, points) {
        if (!receipt || typeof receipt !== "object" || !Number.isSafeInteger(points) || points < 0) {
            throw new TypeError("A receipt and non-negative integer points are required.");
        }
        return {
            id: randomUUID(),
            type: "phoneburp",
            receipt: { ...receipt },
            points,
            timestamp: Date.now()
        };
    }
}

module.exports = BurpEngine;