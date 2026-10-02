const fs = require("node:fs");
const path = require("node:path");
const { loadConfig } = require("./runtimeConfig");

const logs = [];
const MAX_LOG_BYTES = 1024 * 1024;
const MAX_MEMORY_ENTRIES = 500;
const LEVELS = ["info", "warn", "error"];

function logPath() {
    return process.env.CONTINUITY_LOG_FILE ?? path.join(__dirname, "..", "deploy", "logs", "runtime.log");
}

function logEvent(event, config = loadConfig()) {
    if (!event || typeof event !== "object" || Array.isArray(event) || !event.type) {
        throw new TypeError("A continuity log event with a type is required.");
    }
    const level = event.level ?? "info";
    const timestamp = event.timestamp === undefined ? Date.now() : new Date(event.timestamp).getTime();
    if (!LEVELS.includes(level) || !Number.isFinite(timestamp)) {
        throw new TypeError("A valid log level and timestamp are required.");
    }
    const entry = { ...event, level, timestamp };
    if (config.persistenceMode === "file") {
        fs.mkdirSync(path.dirname(logPath()), { recursive: true });
        const line = `${JSON.stringify(entry)}\n`;
        const size = Buffer.byteLength(line);
        if (size > MAX_LOG_BYTES) throw new RangeError("A log entry exceeds the 1MB file limit.");
        if (fs.existsSync(logPath()) && fs.statSync(logPath()).size + size > MAX_LOG_BYTES) {
            fs.rmSync(`${logPath()}.1`, { force: true });
            fs.renameSync(logPath(), `${logPath()}.1`);
        }
        fs.appendFileSync(logPath(), line, { mode: 0o600 });
    }
    logs.push(entry);
    if (logs.length > MAX_MEMORY_ENTRIES) logs.splice(0, logs.length - MAX_MEMORY_ENTRIES);
    return { ...entry };
}

function getLogs(config = loadConfig()) {
    if (config.persistenceMode === "file") {
        return [`${logPath()}.1`, logPath()].flatMap(file =>
            fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)) : []
        );
    }
    return logs.map(entry => ({ ...entry }));
}

function clearLogs(config = loadConfig()) {
    logs.length = 0;
    if (config.persistenceMode === "file" && fs.existsSync(logPath())) {
        fs.writeFileSync(logPath(), "");
    }
    if (config.persistenceMode === "file") fs.rmSync(`${logPath()}.1`, { force: true });
}

module.exports = { logEvent, getLogs, clearLogs };