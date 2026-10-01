const express = require("express");
const router = express.Router();
const core = require("../../../modules/collectorcheck/engine/core");

router.post("/vault", (req, res) => res.json(core.storeArtifact(req.body || {})));
router.get("/provenance", (req, res) => res.json(core.getProvenance()));
router.get("/insurance", (req, res) => res.json({ binder: {} }));
router.get("/valuation", (req, res) => res.json({ valuation: {} }));

module.exports = router;
