const { createRequire } = require("node:module");
const requireEngine = createRequire(require.resolve("../continuity-engine/package.json"));
const express = requireEngine("express");
const ContinuityDispatcher = require("./dispatcher");
const { getModuleStatus } = require("./moduleRegistry");
const { loadConfig } = require("./runtimeConfig");
const { logEvent } = require("./continuityLog");
const { readRuns, appendRun } = require("./runtimeStore");

function createApp(config = loadConfig()) {
    if (config.persistenceMode === "file") readRuns(config.stateFile);
    const app = express();
    const dispatcher = new ContinuityDispatcher(config);
    app.locals.dispatcher = dispatcher;
    const startedAt = Date.now();
    const requestTimeoutMs = config.requestTimeoutMs ?? 10000;
    if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs < 1) {
        throw new RangeError("Request timeout must be a positive integer.");
    }

    app.use((req, res, next) => {
        const timer = setTimeout(() => {
            if (!res.headersSent) res.status(504).json({
                error: { code: "E_REQUEST_TIMEOUT", message: "Continuity request timed out.", timestamp: Date.now() }
            });
        }, requestTimeoutMs);
        res.once("finish", () => clearTimeout(timer));
        res.once("close", () => clearTimeout(timer));
        next();
    });
    app.use(express.json());

    app.get("/continuity/status", (req, res) => {
        const modules = getModuleStatus();
        const healthy = Object.values(modules).every(module => module.healthy);
        res.status(healthy ? 200 : 503).json({
            status: healthy ? "healthy" : "degraded",
            environment: config.environment,
            persistenceMode: config.persistenceMode,
            pipelineMode: config.pipelineMode,
            uptime: Math.floor((Date.now() - startedAt) / 1000),
            eventCount: dispatcher.eventCount,
            lastEventTimestamp: dispatcher.lastEventTimestamp,
            modules
        });
    });

    app.get("/continuity/health", (req, res) => {
        const modules = getModuleStatus();
        const healthy = Object.values(modules).every(module => module.healthy);
        res.status(healthy ? 200 : 503).json({
            status: healthy ? "healthy" : "degraded",
            checkedAt: new Date().toISOString(),
            modules
        });
    });

    app.post("/external/ingest", (req, res, next) => {
        if (typeof req.body?.sourceNode !== "string" || !req.body.sourceNode.trim()) {
            return next(new TypeError("External ingestion requires a sourceNode identifier."));
        }
        next();
    });

    app.post(["/continuity/ingest", "/external/ingest"], async (req, res, next) => {
        try {
            const payload = req.body;
            const eventType = payload?.eventType ?? "burp";
            const methods = {
                burp: "dispatchBurpEvent",
                artifact: "dispatchArtifactEvent",
                identity: "dispatchIdentityEvent"
            };
            if (!Object.hasOwn(methods, eventType)) {
                throw new TypeError("eventType must be burp, artifact, or identity.");
            }
            const result = await dispatcher.dispatchQueued(payload, eventType);
            if (res.headersSent) return;
            if (config.persistenceMode === "file") appendRun(config.stateFile, result);
            if (config.logging) {
                logEvent({ type: "pipeline-complete", burpEventId: result.burpEvent.id, tokenId: result.token.id,
                    ...(result.dispatch.sourceNode ? { sourceNode: result.dispatch.sourceNode } : {}) }, config);
            }
            res.status(201).json(result);
        } catch (error) {
            if (!res.headersSent) next(error);
        }
    });

    app.use((error, req, res, next) => {
        const invalidInput = error.status === 400 || error instanceof TypeError;
        res.status(invalidInput ? 400 : 500).json({ error: {
            code: error.code ?? (invalidInput ? "E_INGEST_FAIL" : "E_PIPELINE_FAIL"),
            message: invalidInput ? error.message : "Continuity runtime failed.",
            timestamp: Date.now()
        } });
    });

    return app;
}

function attachGracefulShutdown(server, onStop = () => {}) {
    let stopping = false;
    function cleanup() {
        process.off("SIGINT", shutdown);
        process.off("SIGTERM", shutdown);
        server.off("close", cleanup);
    }
    function shutdown() {
        if (stopping) return;
        stopping = true;
        cleanup();
        onStop();
        if (server.listening) server.close();
    }
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    server.on("close", cleanup);
    return shutdown;
}

if (require.main === module) {
    const config = loadConfig();
    const server = createApp(config).listen(config.port, () => {
        console.log(`Continuity runtime listening on port ${config.port}`);
    });
    server.requestTimeout = config.requestTimeoutMs ?? 10000;
    attachGracefulShutdown(server);
}

module.exports = { createApp, attachGracefulShutdown };