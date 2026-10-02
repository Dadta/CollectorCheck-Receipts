const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");
const requireEngine = createRequire(require.resolve("../continuity-engine/package.json"));
const dotenv = requireEngine("dotenv");

function loadEnvironment() {
    const envFile = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envFile)) {
        const result = dotenv.config({ path: envFile, quiet: true });
        if (result.error) throw result.error;
    }
    return process.env;
}

function loadConfig(environment = {}) {
    const settings = { ...loadEnvironment(), ...environment };
    const persistenceMode = environment.PERSISTENCE_MODE ?? environment.CONTINUITY_PERSISTENCE ??
        settings.PERSISTENCE_MODE ?? settings.CONTINUITY_PERSISTENCE ?? "memory";
    const pipelineMode = settings.CONTINUITY_PIPELINE_MODE ?? "synchronous";
    const port = Number(environment.PORT_RUNTIME ?? environment.PORT ?? settings.PORT_RUNTIME ?? settings.PORT ?? 4001);

    if (!["memory", "file"].includes(persistenceMode) || pipelineMode !== "synchronous") {
        throw new RangeError("Only memory or file persistence and synchronous pipeline mode are supported.");
    }
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new RangeError("PORT must be an integer from 0 to 65535.");
    }

    return {
        environment: settings.NODE_ENV ?? "development",
        logging: settings.LOG_LEVEL !== "off" && settings.CONTINUITY_LOGGING !== "false",
        persistenceMode,
        pipelineMode,
        stateFile: settings.CONTINUITY_STATE_FILE ?? path.join(os.homedir(), ".continuity-runtime.json"),
        port
    };
}

module.exports = { loadConfig, loadEnvironment };