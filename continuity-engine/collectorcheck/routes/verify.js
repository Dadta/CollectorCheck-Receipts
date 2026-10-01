const express = require("express");
const Artifact = require("../models/artifact");
const adapter = require("../persistence/adapter");

const router = express.Router();

router.post("/", (req, res, next) => {
    const payload = req.body;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return res.status(400).json({ error: "Artifact payload must be a JSON object." });
    }
    if (typeof payload.name !== "string" || !payload.name.trim()) {
        return res.status(400).json({ error: "Artifact name is required." });
    }

    const artifact = new Artifact({ ...payload, name: payload.name.trim() });
    try {
        const record = adapter.writeRecord(artifact);
        return res.json({
            verification: { status: "placeholder", verified: false },
            artifact: record
        });
    } catch (error) {
        if (error.code === "ARTIFACT_EXISTS") {
            return res.status(409).json({ error: "An artifact with this id already exists." });
        }
        return next(error);
    }
});

module.exports = router;