const nodes = [
    { id: "phoneburp", module: "PhoneBurp", responsibility: "Parse receipts and ignite BurpEvents with points" },
    { id: "castlefrenzy", module: "CastleFrenzy", responsibility: "Build the continuity profile and score" },
    { id: "hydrofrenzy", module: "HydroFrenzy", responsibility: "Track household continuity and compute the dignity index" },
    { id: "archivesavior", module: "Archive Savior", responsibility: "Snapshot household state and preserve provenance" },
    { id: "collectorcheck", module: "CollectorCheck", responsibility: "Register artifact evidence; verification remains a placeholder" },
    { id: "ditto", module: "Ditto", responsibility: "Attach artifact provenance to an identity" },
    { id: "dadtabus", module: "Dadtabus", responsibility: "Issue continuity tokens and credit the ledger" }
];

module.exports = {
    nodes,
    edges: nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id }))
};