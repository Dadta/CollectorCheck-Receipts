const { createRequire } = require("node:module");
const requireEngine = createRequire(require.resolve("../continuity-engine/package.json"));
const express = requireEngine("express");
const ContinuityDispatcher = require("./dispatcher");
const { getModuleStatus } = require("./moduleRegistry");
const { loadConfig } = require("./runtimeConfig");
const { logEvent } = require("./continuityLog");

function createApp(config = loadConfig()) {
    const app = express();
    const dispatcher = new ContinuityDispatcher();
    app.use(express.json());

    app.get("/continuity/status", (req, res) => {
        const modules = getModuleStatus();
        const healthy = Object.values(modules).every(module => module.healthy);
        res.status(healthy ? 200 : 503).json({
            status: healthy ? "healthy" : "degraded",
            environment: config.environment,
            persistenceMode: config.persistenceMode,
            pipelineMode: config.pipelineMode,
            modules
        });
    });

    app.post("/continuity/ingest", (req, res, next) => {
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
            const result = dispatcher[methods[eventType]](payload);
            if (config.logging) {
                logEvent({ type: "pipeline-complete", burpEventId: result.burpEvent.id, tokenId: result.token.id });
            }
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    });

    app.use((error, req, res, next) => {
        const invalidInput = error instanceof TypeError || error.status === 400;
        res.status(invalidInput ? 400 : 500).json({ error: invalidInput ? error.message : "Continuity runtime failed." });
    });

    return app;
}

if (require.main === module) {
    const config = loadConfig();
    createApp(config).listen(config.port, () => {
        console.log(`Continuity runtime listening on port ${config.port}`);
    });
}

module.exports = { createApp };