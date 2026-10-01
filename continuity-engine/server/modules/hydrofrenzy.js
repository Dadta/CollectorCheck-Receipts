const express = require("express");
const router = express.Router();
const core = require("../../../modules/hydrofrenzy/engine/core");

router.post("/stickers", (req, res) => res.json(core.scanSticker(req.body || {})));
router.get("/household", (req, res) => res.json(core.getHousehold()));
router.get("/dignity", (req, res) => res.json({ dignity: core.dignityScore() }));
router.get("/community", (req, res) => res.json({ community: {} }));

module.exports = router;
