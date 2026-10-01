const express = require("express");
const router = express.Router();
const core = require("../../../modules/archivesavior/engine/core");

router.get("/provenance", (req, res) => res.json({ lessons: core.provenanceLessons() }));
router.get("/artifact-lessons", (req, res) => res.json({ artifacts: core.artifactLessons() }));
router.get("/future-valuation", (req, res) => {
	const artifact = {
		estimatedValue: Number(req.query.estimatedValue) || 0,
		age: Number(req.query.age) || 0
	};
	res.json({ valuation: core.futureValuation(artifact) });
});
router.post("/future-valuation", (req, res) => {
	const artifact = {
		estimatedValue: Number(req.body.estimatedValue) || 0,
		age: Number(req.body.age) || 0
	};
	res.json({ valuation: core.futureValuation(artifact) });
});

module.exports = router;
