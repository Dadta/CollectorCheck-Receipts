const { parseReceipt } = require("../continuity-engine/phoneburp/receiptParser");
const BurpEngine = require("../continuity-engine/phoneburp/burpEngine");
const Identity = require("../continuity-engine/ditto/identity");
const ContinuityOrchestrator = require("./orchestrator");

function runIntegrationHarness() {
    const receipt = parseReceipt({
        merchant: "Corner Store",
        total: 24.75,
        timestamp: "2026-10-01T12:00:00Z",
        category: "groceries"
    });
    const phoneBurp = new BurpEngine();
    const points = phoneBurp.generateBurpPoints(receipt);
    const burpEvent = phoneBurp.ingestReceipt(receipt);
    const pipeline = new ContinuityOrchestrator();
    pipeline.bindIdentity(new Identity({ name: "Sample Household" }));
    const result = pipeline.runPipeline(burpEvent);

    return { receipt, points, ...result };
}

if (require.main === module) {
    const result = runIntegrationHarness();
    console.log(JSON.stringify({
        points: result.points,
        profile: result.profile.getProfileSummary(),
        dignityIndex: result.dignityIndex,
        archive: result.archive.getArchiveSummary(),
        verification: result.verification,
        identity: result.identity.getContinuitySummary(),
        token: result.token,
        ledger: result.ledger
    }, null, 2));
}

module.exports = { runIntegrationHarness };