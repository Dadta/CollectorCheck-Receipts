function parseReceipt(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new TypeError("A receipt payload object is required.");
    }

    const total = Number(payload.total ?? payload.amount);
    if (!Number.isFinite(total) || total < 0) {
        throw new TypeError("Receipt total must be a non-negative finite number.");
    }

    const merchant = payload.merchant ?? payload.vendor;
    if (typeof merchant !== "string" || !merchant.trim()) {
        throw new TypeError("Receipt merchant is required.");
    }

    const timestamp = payload.timestamp ?? Date.now();
    if (Number.isNaN(new Date(timestamp).getTime())) {
        throw new TypeError("Receipt timestamp must be a valid date.");
    }

    return {
        merchant: merchant.trim(),
        total,
        timestamp,
        category: payload.category || "uncategorized"
    };
}

module.exports = { parseReceipt };