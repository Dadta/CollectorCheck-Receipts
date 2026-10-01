const { getModuleStatus } = require("../../runtime/moduleRegistry");

async function status() {
    const baseUrl = process.env.CONTINUITY_RUNTIME_URL || "http://127.0.0.1:4001";
    try {
        const response = await fetch(new URL("/continuity/status", baseUrl), {
            signal: AbortSignal.timeout(2000)
        });
        const health = await response.json();
        return {
            runtime: {
                status: health.status,
                environment: health.environment,
                persistenceMode: health.persistenceMode,
                pipelineMode: health.pipelineMode
            },
            modules: health.modules
        };
    } catch (error) {
        return { runtime: { status: "offline" }, modules: getModuleStatus() };
    }
}

module.exports = status;