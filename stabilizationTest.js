const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");
const BurpEngine = require("./continuity-engine/phoneburp/burpEngine");
const ContinuityLedger = require("./continuity-engine/dadtabus/ledger");
const { createApp } = require("./runtime/runtimeServer");
const { loadConfig } = require("./runtime/runtimeConfig");
const { clearLogs, getLogs, logEvent } = require("./runtime/continuityLog");
const { createDashboardApp } = require("./dashboard/dashboardServer");

function installProductionGuard() {
    const protectedDirectories = ["data", "logs"].map(name => path.join(__dirname, "deploy", name));
    const originalWrites = Object.fromEntries(["writeFileSync", "appendFileSync", "renameSync", "rmSync", "mkdirSync", "openSync"].map(name => [name, fs[name]]));
    function protect(file) {
        if (typeof file === "string" && protectedDirectories.some(directoryPath =>
            path.resolve(file) === directoryPath || path.resolve(file).startsWith(directoryPath + path.sep))) {
            throw new Error(`Stabilization attempted a production write: ${file}`);
        }
    }
    fs.writeFileSync = function(file, ...args) { protect(file); return originalWrites.writeFileSync.call(fs, file, ...args); };
    fs.appendFileSync = function(file, ...args) { protect(file); return originalWrites.appendFileSync.call(fs, file, ...args); };
    fs.renameSync = function(source, target) { protect(source); protect(target); return originalWrites.renameSync.call(fs, source, target); };
    fs.rmSync = function(file, ...args) { protect(file); return originalWrites.rmSync.call(fs, file, ...args); };
    fs.mkdirSync = function(file, ...args) { protect(file); return originalWrites.mkdirSync.call(fs, file, ...args); };
    fs.openSync = function(file, flags, ...args) {
        if (typeof flags === "string" && /[wax]/.test(flags)) protect(file);
        return originalWrites.openSync.call(fs, file, flags, ...args);
    };
    return () => {
        for (const [name, original] of Object.entries(originalWrites)) fs[name] = original;
    };
}

async function runStabilizationTest() {
    const restoreGuard = installProductionGuard();
    const previousMode = process.env.PERSISTENCE_MODE;
    const previousLogFile = process.env.CONTINUITY_LOG_FILE;
    process.env.PERSISTENCE_MODE = "memory";
    const config = loadConfig({ PERSISTENCE_MODE: "memory", LOG_LEVEL: "info", CONTINUITY_LOGGING: "true" });
    clearLogs(config);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "ce-stabilization-"));

    const unhandled = [];
    const onRejection = error => unhandled.push(error);
    process.on("unhandledRejection", onRejection);
    let runtime;
    let dashboard;
    try {
        const app = createApp(config);
        runtime = app.listen(0, "127.0.0.1");
        dashboard = createDashboardApp().listen(0, "127.0.0.1");
        await Promise.all([once(runtime, "listening"), once(dashboard, "listening")]);

        const base = `http://127.0.0.1:${runtime.address().port}`;
        async function ingest(payload) {
            const response = await fetch(`${base}/continuity/ingest`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            assert.equal(response.status, 201, JSON.stringify(result));
            return result;
        }

        const burps = Array.from({ length: 10 }, () => ingest({
            burpEvent: new BurpEngine().ingestReceipt({ merchant: "Stabilization Store", total: 2.75 })
        }));
        const pipelines = Array.from({ length: 5 }, () => ingest({
            receipt: { merchant: "Pipeline Market", total: 3.25 }
        }));
        const results = await Promise.all([...burps, ...pipelines]);
        const ledger = new ContinuityLedger({ entries: results.map(result => result.entry) });
        assert.equal(ledger.getEntries().length, 15);
        assert.equal(ledger.getBalance(), 35);
        assert.equal(getLogs(config).filter(entry => entry.type === "pipeline-complete").length, 15);
        assert.ok(results.every(result => result.summary.stages.length === 7 &&
            result.summary.stages.every(stage => Number.isFinite(stage.durationMs) && stage.durationMs >= 0)));
        assert.equal(app.locals.dispatcher.pending, 0);
        assert.equal(app.locals.dispatcher.busy, false);
        const healthResponse = await fetch(`${base}/continuity/health`);
        const health = await healthResponse.json();
        assert.equal(healthResponse.status, 200);
        assert.ok(Object.values(health.modules).every(module => module.status === "healthy"));
        const status = await (await fetch(`${base}/continuity/status`)).json();
        assert.equal(status.eventCount, 15);
        assert.equal((await fetch(`http://127.0.0.1:${dashboard.address().port}/`)).status, 200);

        process.env.CONTINUITY_LOG_FILE = path.join(directory, "runtime.log");
        const fileConfig = { persistenceMode: "file" };
        for (let index = 0; index < 13; index++) {
            logEvent({ type: "rotation-check", level: "info", payload: "x".repeat(90000) }, fileConfig);
        }
        assert.ok(fs.existsSync(`${process.env.CONTINUITY_LOG_FILE}.1`));
        assert.ok(fs.statSync(process.env.CONTINUITY_LOG_FILE).size <= 1024 * 1024);
        assert.ok(fs.statSync(`${process.env.CONTINUITY_LOG_FILE}.1`).size <= 1024 * 1024);
        assert.equal(unhandled.length, 0);
        const summary = { events: status.eventCount, balance: ledger.getBalance(), health: health.status, queueDepth: app.locals.dispatcher.pending, rotation: true, productionWrites: 0 };
        console.log(JSON.stringify(summary, null, 2));
        return summary;
    } finally {
        process.off("unhandledRejection", onRejection);
        if (runtime?.listening) await new Promise(resolve => runtime.close(resolve));
        if (dashboard?.listening) await new Promise(resolve => dashboard.close(resolve));
        restoreGuard();
        if (previousMode === undefined) delete process.env.PERSISTENCE_MODE;
        else process.env.PERSISTENCE_MODE = previousMode;
        if (previousLogFile === undefined) delete process.env.CONTINUITY_LOG_FILE;
        else process.env.CONTINUITY_LOG_FILE = previousLogFile;
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

if (require.main === module) runStabilizationTest().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

module.exports = { runStabilizationTest, installProductionGuard };