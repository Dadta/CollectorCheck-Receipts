const { createDashboardApp } = require("../dashboard/dashboardServer");
const { loadConfig, loadEnvironment } = require("../runtime/runtimeConfig");

function startDashboard(environment = {}) {
    const settings = { ...loadEnvironment(), ...environment };
    const config = loadConfig({ ...settings, PORT_RUNTIME: settings.PORT_RUNTIME ?? 4000 });
    const port = Number(settings.PORT_DASHBOARD ?? 4100);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new RangeError("PORT_DASHBOARD must be an integer from 0 to 65535.");
    }
    const server = createDashboardApp().listen(port, "127.0.0.1", () => {
        console.log(`Continuity Engine Dashboard | ${config.environment} | ${config.persistenceMode} persistence | Logs: ${config.logging ? config.persistenceMode : "off"}`);
        console.log(`Dashboard URL: http://127.0.0.1:${server.address().port}/`);
        console.log(`Runtime URL: http://127.0.0.1:${config.port}/continuity/status`);
    });
    return server;
}

if (require.main === module) startDashboard();

module.exports = { startDashboard };