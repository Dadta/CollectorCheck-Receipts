const express = require("express");
const router = express.Router();
const core = require("../../../modules/burpfrenzy/engine/core");

router.get("/quests", (req, res) => res.json({ quests: core.getQuests() }));
router.post("/pufftokens", (req, res) => res.json(core.award(req.body.amount)));
router.get("/pufftokens", (req, res) => res.json(core.getTokens()));
router.get("/tokens", (req, res) => res.json(core.getTokens()));
router.post("/quests/:questId/complete", (req, res) => {
	const result = core.completeQuest(req.params.questId);
	res.status(result.error ? 404 : 200).json(result);
});
router.get("/gigbob", (req, res) => res.json({ gigbob: {} }));
router.get("/visualization", (req, res) => res.json({ viz: {} }));

module.exports = router;
