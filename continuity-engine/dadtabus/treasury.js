class Treasury {
    constructor() {
        this.accounts = new Map();
    }

    getIdentityId(identity) {
        const id = typeof identity === "object" && identity !== null ? identity.id : identity;
        if (id === undefined || id === null || String(id).trim() === "") {
            throw new TypeError("An identity with an id is required.");
        }
        return String(id);
    }

    getAccount(identity) {
        const identityId = this.getIdentityId(identity);
        if (!this.accounts.has(identityId)) {
            this.accounts.set(identityId, { balance: 0, transactions: [] });
        }
        return { identityId, account: this.accounts.get(identityId) };
    }

    validateAmount(amount) {
        const value = Number(amount);
        if (!Number.isFinite(value) || value <= 0) {
            throw new TypeError("Amount must be a positive finite number.");
        }
        return value;
    }

    credit(identity, amount) {
        return this.transact(identity, amount, "credit");
    }

    debit(identity, amount) {
        return this.transact(identity, amount, "debit");
    }

    transact(identity, amount, type) {
        const value = this.validateAmount(amount);
        const { identityId, account } = this.getAccount(identity);
        if (type === "debit" && account.balance < value) {
            throw new RangeError("Insufficient treasury balance.");
        }

        account.balance += type === "credit" ? value : -value;
        const transaction = { id: require("crypto").randomUUID(), type, amount: value, timestamp: Date.now() };
        account.transactions.push(transaction);
        return { identityId, balance: account.balance, transaction: { ...transaction } };
    }

    getStatement(identity) {
        const { identityId, account } = this.getAccount(identity);
        return {
            identityId,
            balance: account.balance,
            transactions: account.transactions.map(transaction => ({ ...transaction }))
        };
    }
}

module.exports = new Treasury();