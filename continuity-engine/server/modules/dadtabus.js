const express = require("express");
const router = express.Router();
const core = require("../../../modules/dadtabus/engine/core");

router.post("/micropay", (req, res) => res.json(core.micropay(req.body || {})));
router.post("/route", (req, res) => res.json(core.route(req.body || {})));
router.post("/transport", (req, res) => res.json(core.route(req.body || {})));
router.get("/routing", (req, res) => res.json({ routing: {} }));

module.exports = router;
