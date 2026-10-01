const express = require("express");
const router = express.Router();
const core = require("../../../modules/castlefrenzy/engine/core");

router.get("/rooms", (req, res) => res.json({ rooms: core.getRooms() }));
router.post("/rooms", (req, res) => res.json(core.addRoom(req.body.name)));
router.get("/identity", (req, res) => res.json({ identity: {} }));
router.get("/castle", (req, res) => res.json({ castle: {} }));

module.exports = router;
