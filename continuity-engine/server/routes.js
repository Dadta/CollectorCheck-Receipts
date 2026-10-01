const express = require("express");
const router = express.Router();

// Engine components
const continuityScore = require("../continuity-score");
const binderExport = require("../binder-export");
const provenanceLedger = require("../provenance-ledger");
const identityRail = require("../identity-rail");
const continuityTransport = require("../continuity-transport");

// Unified endpoints

router.get("/continuity-score", (req, res) => {
    const score = continuityScore.aggregate();
    res.json(score);
});

router.post("/binder-export", (req, res) => {
    const binder = binderExport.exportBinder(req.body.userId);
    res.json(binder);
});

router.post("/provenance-record", (req, res) => {
    const result = provenanceLedger.recordArtifact(req.body.artifact);
    res.json(result);
});

router.get("/provenance-ledger/:userId", (req, res) => {
    const ledger = provenanceLedger.getLedger(req.params.userId);
    res.json(ledger);
});

router.post("/identity-bind", (req, res) => {
    const result = identityRail.bindIdentity(req.body.userId, req.body.payload);
    res.json(result);
});

router.get("/identity/:userId", (req, res) => {
    const identity = identityRail.getIdentity(req.params.userId);
    res.json(identity);
});

router.post("/transport", (req, res) => {
    const result = continuityTransport.transport(req.body);
    res.json(result);
});

router.post("/micropay", (req, res) => {
    const result = continuityTransport.micropay(req.body);
    res.json(result);
});

router.use("/phoneburp-base", require("./modules/phoneburp-base"));
router.use("/phoneburp-thinker", require("./modules/phoneburp-thinker"));
router.use("/burpfrenzy", require("./modules/burpfrenzy"));
router.use("/castlefrenzy", require("./modules/castlefrenzy"));
router.use("/hydrofrenzy", require("./modules/hydrofrenzy"));
router.use("/archivesavior", require("./modules/archivesavior"));
router.use("/collectorcheck", require("./modules/collectorcheck"));
router.use("/ditto", require("./modules/ditto"));
router.use("/dadtabus", require("./modules/dadtabus"));

module.exports = router;
