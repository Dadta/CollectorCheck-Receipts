const Archive = require("./archive");

const archives = new Map();

function createArchive(input = {}) {
    const archive = input instanceof Archive ? input : new Archive(input);
    if (archives.has(String(archive.id))) {
        throw new Error(`Archive already exists: ${archive.id}`);
    }

    archives.set(String(archive.id), archive);
    return archive;
}

function getArchive(id) {
    return archives.get(String(id)) || null;
}

function updateArchive(id, updates) {
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
        throw new TypeError("Archive updates must be an object.");
    }

    const archive = getArchive(id);
    if (!archive) return null;

    if (updates.artifactId !== undefined) archive.artifactId = updates.artifactId;
    if (updates.identityId !== undefined) archive.identityId = updates.identityId;
    if (updates.provenanceChain !== undefined) {
        if (!Array.isArray(updates.provenanceChain)) throw new TypeError("provenanceChain must be an array.");
        archive.provenanceChain = [...updates.provenanceChain];
    }
    if (updates.continuitySnapshots !== undefined) {
        if (!Array.isArray(updates.continuitySnapshots)) throw new TypeError("continuitySnapshots must be an array.");
        archive.continuitySnapshots = [...updates.continuitySnapshots];
    }

    return archive;
}

function deleteArchive(id) {
    return archives.delete(String(id));
}

module.exports = { createArchive, getArchive, updateArchive, deleteArchive };