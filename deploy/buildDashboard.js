const fs = require("node:fs");
const path = require("node:path");

function buildDashboard() {
    const source = path.join(__dirname, "..", "dashboard");
    const output = path.join(__dirname, "dist", "dashboard");
    fs.mkdirSync(output, { recursive: true });
    fs.cpSync(path.join(source, "public"), path.join(output, "public"), { recursive: true });
    fs.cpSync(path.join(source, "views"), path.join(output, "views"), { recursive: true });
    return output;
}

if (require.main === module) console.log(`Dashboard assets prepared at ${buildDashboard()}`);

module.exports = { buildDashboard };