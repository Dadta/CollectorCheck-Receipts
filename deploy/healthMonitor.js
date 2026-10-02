const { getModuleStatus } = require("../runtime/moduleRegistry");
const { logEvent } = require("../runtime/continuityLog");

function startHealthMonitor(intervalMs = 30000, config) {
    if (!Number.isSafeInteger(intervalMs) || intervalMs < 1000) {
        throw new RangeError("Health check interval must be at least 1000ms.");
    }
    function check() {
        const modules = getModuleStatus();
        return logEvent({
            type: "module-health",
            status: Object.values(modules).every(module => module.healthy) ? "healthy" : "degraded",
            modules
        }, config);
    }
    check();
    return setInterval(check, intervalMs);
}

if (require.main === module) startHealthMonitor();

module.exports = { startHealthMonitor };