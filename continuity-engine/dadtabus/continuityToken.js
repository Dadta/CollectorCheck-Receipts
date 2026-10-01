const { randomUUID } = require("crypto");

class ContinuityToken {
    constructor({ id = randomUUID(), timestamp = Date.now(), sourceModule, payload = {} } = {}) {
        this.id = id;
        this.timestamp = timestamp;
        this.sourceModule = sourceModule;
        this.payload = payload;
    }
}

function createToken(sourceModule, payload = {}) {
    if (typeof sourceModule !== "string" || !sourceModule.trim()) {
        throw new TypeError("A source module is required.");
    }

    return new ContinuityToken({ sourceModule: sourceModule.trim(), payload });
}

module.exports = { ContinuityToken, createToken };