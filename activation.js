const { once } = require("node:events");
const { loadEnvironment } = require("./runtime/runtimeConfig");
const { startRuntime } = require("./deploy/startRuntime");
const { startDashboard } = require("./deploy/startDashboard");
const BurpEngine = require("./continuity-engine/phoneburp/burpEngine");
const ContinuityLedger = require("./continuity-engine/dadtabus/ledger");
const { getLogs } = require("./runtime/continuityLog");

async function activate() {
    loadEnvironment();
    const overrides = {
        PORT_RUNTIME: "5001",
        PORT_DASHBOARD: "5002",
        PERSISTENCE_MODE: "memory",
        LOG_LEVEL: "info",
        CONTINUITY_LOGGING: "true"
    };
    let runtime;
    let dashboard;
    try {
        runtime = startRuntime(overrides);
        dashboard = startDashboard(overrides);
        await Promise.all([once(runtime.server, "listening"), once(dashboard, "listening")]);

        const base = "http://127.0.0.1:5001";
        async function ingest(payload) {
            const response = await fetch(`${base}/continuity/ingest`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Ingest failed: HTTP ${response.status}`);
            return result;
        }

        const burpEvent = new BurpEngine().ingestReceipt({ merchant: "Activation Store", total: 12.75 });
        const first = await ingest({ burpEvent });
        const second = await ingest({ receipt: { merchant: "Pipeline Market", total: 8.50, category: "groceries" } });
        const dashboardResponse = await fetch("http://127.0.0.1:5002/");
        if (!dashboardResponse.ok) throw new Error(`Dashboard failed: HTTP ${dashboardResponse.status}`);

        const ledger = new ContinuityLedger({ entries: [first.entry, second.entry] }).exportLedger();
        const archive = second.archive;
        const summary = {
            mode: "memory",
            burpEventId: first.burpEvent.id,
            pipelineEventId: second.burpEvent.id,
            ledger,
            logs: getLogs(runtime.config),
            archive: {
                id: archive.id,
                artifactId: archive.artifactId,
                provenanceSteps: archive.provenanceChain.length,
                continuitySnapshots: archive.continuitySnapshots.length
            }
        };
        console.log(JSON.stringify(summary, null, 2));
        return summary;
    } finally {
        if (runtime) {
            const closed = runtime.server.listening ? once(runtime.server, "close") : Promise.resolve();
            runtime.stop();
            await closed;
        }
        if (dashboard?.listening) await new Promise(resolve => dashboard.close(resolve));
    }
}

if (require.main === module) {
    activate().catch(error => {
        console.error(`Activation failed: ${error.message}`);
        process.exitCode = 1;
    });
}

module.exports = { activate };