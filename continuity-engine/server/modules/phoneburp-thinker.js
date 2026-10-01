const express = require("express");
const router = express.Router();
const core = require("../../../modules/phoneburp-thinker/engine/core");
const continuityScore = require("../../continuity-score");

router.get("/categorize", (req, res) => res.json(core.autoCategorize()));
router.get("/tax", (req, res) => res.json(core.computeTax()));
router.get("/rebates", (req, res) => res.json({ rebates: [] }));
router.get("/warranty", (req, res) => res.json({ warranty: [] }));
router.get("/continuity-score", (req, res) => res.json(continuityScore.aggregate()));

module.exports = router;
