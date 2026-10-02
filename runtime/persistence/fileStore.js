const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const eventFile = path.join(__dirname, "..", "..", "deploy", "data", "runtime-events.json");

function storeError(code, message, cause) {
    const error = new Error(message, { cause });
    error.code = code;
    return error;
}

function withLock(file, action) {
    const lock = `${file}.lock`;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let descriptor;
    try {
        descriptor = fs.openSync(lock, "wx", 0o600);
    } catch (error) {
        throw storeError(error.code === "EEXIST" ? "E_FILE_LOCKED" : "E_FILE_IO", `Cannot lock event file: ${file}`, error);
    }
    try {
        return action();
    } finally {
        fs.closeSync(descriptor);
        fs.unlinkSync(lock);
    }
}

function atomicWrite(file, events) {
    const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
    try {
        fs.writeFileSync(temporary, `${JSON.stringify(events, null, 2)}\n`, { mode: 0o600 });
        fs.renameSync(temporary, file);
    } catch (error) {
        throw storeError("E_FILE_IO", `Cannot write event file: ${file}`, error);
    } finally {
        if (fs.existsSync(temporary)) fs.rmSync(temporary);
    }
}

function readLocked(file) {
    if (!fs.existsSync(file)) atomicWrite(file, []);
    try {
        const events = JSON.parse(fs.readFileSync(file, "utf8"));
        if (!Array.isArray(events)) throw new SyntaxError("Event store must contain an array.");
        return events;
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw storeError("E_FILE_IO", `Cannot read event file: ${file}`, error);
        const backup = `${file}.corrupt.${Date.now()}.${randomUUID()}`;
        try {
            fs.renameSync(file, backup);
        } catch (cause) {
            throw storeError("E_FILE_IO", `Cannot quarantine corrupt event file: ${file}`, cause);
        }
        atomicWrite(file, []);
        return [];
    }
}

function readEvents(file = eventFile) {
    return withLock(file, () => readLocked(file));
}

function writeEvent(event, file = eventFile) {
    if (!event || typeof event !== "object" || Array.isArray(event)) {
        throw storeError("E_EVENT_INVALID", "A continuity event object is required.");
    }
    return withLock(file, () => {
        const events = readLocked(file);
        events.push(event);
        atomicWrite(file, events);
        return event;
    });
}

function clearEvents(file = eventFile) {
    return withLock(file, () => atomicWrite(file, []));
}

module.exports = { writeEvent, readEvents, clearEvents };