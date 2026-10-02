const { loadConfig, loadEnvironment } = require("../runtime/runtimeConfig");
const { createApp, attachGracefulShutdown } = require("../runtime/runtimeServer");
const { startHealthMonitor } = require("./healthMonitor");

function startRuntime(environment = {}) {
    const settings = { ...loadEnvironment(), ...environment };
    const config = loadConfig({
        ...settings,
        PORT_RUNTIME: settings.PORT_RUNTIME ?? settings.PORT ?? 4000
    });
    const server = createApp(config).listen(config.port, "127.0.0.1", () => {
        console.log(`Continuity Engine Runtime | ${config.environment} | ${config.persistenceMode} persistence`);
        console.log(`Runtime port: ${server.address().port} | Dashboard port: ${settings.PORT_DASHBOARD ?? 4100} | Logs: ${config.logging ? config.persistenceMode : "off"}`);
        console.log(`Runtime URL: http://127.0.0.1:${server.address().port}/continuity/status`);
        console.log(`Dashboard URL: http://127.0.0.1:${settings.PORT_DASHBOARD ?? 4100}/`);
    });
    const monitor = config.logging ? startHealthMonitor(30000, config) : null;
    server.requestTimeout = config.requestTimeoutMs ?? 10000;
    const shutdown = attachGracefulShutdown(server, () => {
        if (monitor) clearInterval(monitor);
    });
    return {
        server,
        config,
        stop() {
            shutdown();
        }
    };
}

if (require.main === module) startRuntime();

module.exports = { startRuntime };