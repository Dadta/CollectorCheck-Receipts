const express = require("express");
const router = express.Router();
const core = require("../../../modules/ditto/engine/core");

router.get("/identity", (req, res) => {
	const identity = req.query.userId ? core.get(String(req.query.userId)) : {};
	res.json({ identity });
});
router.get("/identity/:userId", (req, res) => res.json(core.get(req.params.userId)));
router.post("/bind", (req, res) => res.json(core.bind(req.body.userId, req.body.payload)));
router.post("/transport", (req, res) => res.json({ transported: true }));

module.exports = router;
