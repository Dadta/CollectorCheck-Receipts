const express = require("express");
const router = express.Router();
const core = require("../../../modules/phoneburp-base/engine/core");

router.post("/ingest", (req, res) => res.json(core.ingest(req.body || {})));
router.post("/burp", (req, res) => res.json(core.burp()));
router.get("/receipts", (req, res) => res.json(core.getReceipts()));
router.get("/castle", (req, res) => res.json({ castle: "seed" }));
router.get("/burppoints", (req, res) => res.json({ points: 0 }));

module.exports = router;
