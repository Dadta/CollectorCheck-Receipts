const { randomUUID } = require("crypto");

class ContinuityLedger {
    constructor({ id = randomUUID(), entries = [] } = {}) {
        this.id = id;
        this.entries = Array.isArray(entries) ? entries.map(entry => ({ ...entry })) : [];
    }

    addEntry(entry) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            throw new TypeError("A ledger entry object is required.");
        }

        const amount = entry.amount === undefined ? 0 : Number(entry.amount);
        if (!Number.isFinite(amount)) throw new TypeError("Ledger entry amount must be finite.");

        const storedEntry = {
            ...entry,
            id: entry.id ?? randomUUID(),
            timestamp: entry.timestamp ?? Date.now(),
            amount
        };
        this.entries.push(storedEntry);
        return { ...storedEntry };
    }

    getEntries() {
        return this.entries.map(entry => ({ ...entry }));
    }

    getBalance() {
        return this.entries.reduce((balance, entry) => {
            const amount = Number(entry.amount ?? 0);
            const direction = entry.direction || (entry.type === "credit" || entry.type === "debit" ? entry.type : null);
            if (direction === "credit") return balance + Math.abs(amount);
            if (direction === "debit") return balance - Math.abs(amount);
            return balance + amount;
        }, 0);
    }

    exportLedger() {
        return {
            id: this.id,
            entries: this.getEntries(),
            balance: this.getBalance()
        };
    }
}

module.exports = ContinuityLedger;