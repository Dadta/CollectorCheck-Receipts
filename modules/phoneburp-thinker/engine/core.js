const db = require("../../../continuity-engine/persistence/db");

function categorize(receipt) {
    const vendor = String(receipt.vendor || "").toLowerCase();

    if (vendor.includes("walmart")) return "general";
    if (vendor.includes("home depot")) return "home_improvement";
    if (vendor.includes("amazon")) return "online";
    if (vendor.includes("shell") || vendor.includes("esso")) return "fuel";

    return "uncategorized";
}

function taxModel(receipt) {
    return {
        deductible: receipt.category === "fuel" ? Number(receipt.amount || 0) * 0.20 : 0
    };
}

module.exports = {
    init() {
        return "phoneburp-thinker ready";
    },

    autoCategorize() {
        const data = db.load();
        const receipts = data.receipts || [];
        receipts.forEach((receipt) => {
            receipt.category = categorize(receipt);
        });
        db.save(data);
        return receipts;
    },

    computeTax() {
        const data = db.load();
        const receipts = data.receipts || [];
        return receipts.map((receipt) => ({
            id: receipt.id,
            vendor: receipt.vendor,
            amount: receipt.amount,
            category: receipt.category,
            tax: taxModel(receipt)
        }));
    }
};
