function loadConfig(environment = process.env) {
    const persistenceMode = environment.CONTINUITY_PERSISTENCE ?? "memory";
    const pipelineMode = environment.CONTINUITY_PIPELINE_MODE ?? "synchronous";
    const port = Number(environment.PORT ?? 4001);

    if (persistenceMode !== "memory" || pipelineMode !== "synchronous") {
        throw new RangeError("Only memory persistence and synchronous pipeline mode are supported.");
    }
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new RangeError("PORT must be an integer from 0 to 65535.");
    }

    return {
        environment: environment.NODE_ENV ?? "development",
        logging: environment.CONTINUITY_LOGGING !== "false",
        persistenceMode,
        pipelineMode,
        port
    };
}

module.exports = { loadConfig };