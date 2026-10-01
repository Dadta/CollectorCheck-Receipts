const fs = require("node:fs");

async function verify(file) {
    const artifact = JSON.parse(fs.readFileSync(file, "utf8"));
    const baseUrl = process.env.COLLECTORCHECK_URL || "http://127.0.0.1:4002";
    const response = await fetch(new URL("/verify", baseUrl), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(artifact),
        signal: AbortSignal.timeout(5000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `CollectorCheck returned HTTP ${response.status}`);
    return result;
}

module.exports = verify;