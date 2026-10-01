const { test } = require("node:test");
const assert = require("node:assert/strict");
const BurpEngine = require("../continuity-engine/phoneburp/burpEngine");
const Artifact = require("../continuity-engine/collectorcheck/models/artifact");
const Identity = require("../continuity-engine/ditto/identity");
const ContinuityOrchestrator = require("./orchestrator");
const flowMap = require("./flowMap");
const { runIntegrationHarness } = require("./integrationHarness");

test("a receipt crosses all seven modules and credits the continuity ledger", () => {
    const result = runIntegrationHarness();
    assert.equal(result.receipt.merchant, "Corner Store");
    assert.equal(result.points, 24);
    assert.equal(result.burpEvent.points, result.points);
    assert.equal(result.profile.riskProfile.burpEventId, result.burpEvent.id);
    assert.equal(result.householdLedger.continuityEvents[0].profileId, result.profile.id);
    assert.equal(result.dignityIndex.maximum, 100);
    assert.equal(result.archive.continuitySnapshots[0].payload.dignityIndex.score, result.dignityIndex.score);
    assert.equal(result.artifact.continuityRecord.archiveId, result.archive.id);
    assert.deepEqual(result.verification, { status: "placeholder", verified: false });
    assert.equal(result.identity.provenance[0].artifactId, result.artifact.id);
    assert.equal(result.token.payload.burpEventId, result.burpEvent.id);
    assert.equal(result.ledger.entries[0].id, result.token.id);
    assert.equal(result.ledger.balance, result.points);
});

test("explicit identity and artifact bindings are used by the pipeline", () => {
    const pipeline = new ContinuityOrchestrator();
    const identity = new Identity({ name: "Household" });
    const artifact = new Artifact({ name: "Purchase evidence" });
    pipeline.bindIdentity(identity);
    pipeline.bindArtifact(artifact);
    const result = pipeline.runPipeline(new BurpEngine().ingestReceipt({ merchant: "Shop", total: 3.50 }));
    assert.equal(result.identity, identity);
    assert.equal(result.artifact, artifact);
    assert.equal(identity.continuityRecords.length, 2);
    assert.equal(result.ledger.balance, 3);
});

test("invalid events cannot create ledger credits", () => {
    const pipeline = new ContinuityOrchestrator();
    assert.throws(() => pipeline.recordContinuity({ amount: 1 }), /Bind an identity/);
    assert.throws(() => pipeline.runPipeline({ id: "bad", receipt: { total: 2 }, points: 3 }), TypeError);
    assert.equal(pipeline.ledger.getEntries().length, 0);
});

test("the flow map records the same seven stages", () => {
    assert.equal(flowMap.nodes.length, 7);
    assert.equal(flowMap.edges.length, 6);
    assert.equal(flowMap.edges[0].from, "phoneburp");
    assert.equal(flowMap.edges.at(-1).to, "dadtabus");
});