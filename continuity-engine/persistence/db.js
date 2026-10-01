const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

function load() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function save(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function ensureCollection(data, name) {
    if (!data[name]) data[name] = [];
}

module.exports = { load, save, ensureCollection };
