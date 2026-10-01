const { randomUUID } = require("crypto");

class Artifact {
    constructor({ id = randomUUID(), name, description = "", provenance = [], continuityRecord = null } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.provenance = provenance;
        this.continuityRecord = continuityRecord;
    }
}

module.exports = Artifact;