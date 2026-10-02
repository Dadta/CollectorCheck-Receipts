const { test } = require("node:test");
const assert = require("node:assert/strict");
const BurpEngine = require("../continuity-engine/phoneburp/burpEngine");
const Artifact = require("../continuity-engine/collectorcheck/models/artifact");
const Identity = require("../continuity-engine/ditto/identity");
const ContinuityOrchestrator = require("./orchestrator");
const flowMap = require("./flowMap");
const { runIntegrationHarness } = require("./integrationHarness");
const { createApp } = require("../runtime/runtimeServer");
const { installProductionGuard } = require("../stabilizationTest");

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

test("external ingress binds remote identity, artifact, and provenance", async () => {
    const restoreGuard = installProductionGuard();
    const app = createApp({ persistenceMode: "memory", logging: false });
    const server = app.listen(0, "127.0.0.1");
    try {
        await new Promise(resolve => server.once("listening", resolve));
        const url = `http://127.0.0.1:${server.address().port}/external/ingest`;
        const payload = {
            sourceNode: "remote-west",
            eventType: "artifact",
            receipt: { merchant: "Shop", total: 6.25 },
            identity: { id: "remote-person", name: "Remote Household" },
            artifact: { id: "remote-document", name: "Receipt scan" },
            provenance: [{ actor: "remote-agent", action: "scanned", timestamp: "2026-10-01T12:00:00Z", payload: { ref: "A-1" } }]
        };
        const send = body => fetch(url, {
            method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
        });
        const response = await send(payload);
        const result = await response.json();
        assert.equal(response.status, 201);
        assert.equal(result.identity.id, "remote-person");
        assert.equal(result.artifact.id, "remote-document");
        assert.equal(result.archive.provenanceChain[1].sourceNode, "remote-west");
        assert.equal(result.identity.provenance[0].provenance[1].payload.ref, "A-1");
        assert.equal(result.token.payload.sourceNode, "remote-west");
        assert.equal(result.verification.verified, false);
        assert.equal(result.ledger.balance, 6);

        const invalid = await send({ ...payload, provenance: [{ actor: "", action: "scanned" }] });
        assert.equal(invalid.status, 400);
        assert.equal((await invalid.json()).error.code, "E_INGEST_FAIL");
        for (const route of ["/external/ingest", "/EXTERNAL/INGEST", "/external/ingest/"]) {
            const missingNode = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
                method: "POST", headers: { "content-type": "application/json" },
                body: JSON.stringify({ receipt: payload.receipt })
            });
            assert.equal(missingNode.status, 400);
        }
        assert.equal(app.locals.dispatcher.eventCount, 1);
    } finally {
        await new Promise(resolve => server.close(resolve));
        restoreGuard();
    }
});