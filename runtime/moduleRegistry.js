const moduleRegistry = {
    PhoneBurp: {
        version: "unversioned",
        checkHealth: () => typeof require("../continuity-engine/phoneburp/burpEngine") === "function"
    },
    CastleFrenzy: {
        version: "unversioned",
        checkHealth: () => typeof require("../continuity-engine/castlefrenzy").ContinuityProfile === "function"
    },
    HydroFrenzy: {
        version: "unversioned",
        checkHealth: () => typeof require("../continuity-engine/hydrofrenzy").calculateDignityIndex === "function"
    },
    ArchiveSavior: {
        version: "unversioned",
        checkHealth: () => typeof require("../continuity-engine/archivesavior").Archive === "function"
    },
    CollectorCheck: {
        version: "unversioned",
        checkHealth: () => typeof require("../continuity-engine/collectorcheck/models/artifact") === "function"
    },
    Ditto: {
        version: "unversioned",
        checkHealth: () => typeof require("../continuity-engine/ditto/identity") === "function"
    },
    Dadtabus: {
        version: "unversioned",
        checkHealth: () => typeof require("../continuity-engine/dadtabus").recordContinuityEvent === "function"
    }
};

function getModuleStatus() {
    return Object.fromEntries(Object.entries(moduleRegistry).map(([name, module]) => {
        try {
            return [name, { version: module.version, healthy: module.checkHealth() }];
        } catch (error) {
            return [name, { version: module.version, healthy: false }];
        }
    }));
}

module.exports = { moduleRegistry, getModuleStatus };