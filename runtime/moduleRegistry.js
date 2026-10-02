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
        const lastCheck = new Date().toISOString();
        const start = process.hrtime.bigint();
        let healthy = false;
        const errors = [];
        try {
            healthy = module.checkHealth() === true;
            if (!healthy) errors.push("Module health check failed.");
        } catch (error) {
            errors.push(error.message);
        }
        return [name, {
            version: module.version,
            healthy,
            status: healthy ? "healthy" : "unhealthy",
            lastCheck,
            latency: Number(process.hrtime.bigint() - start) / 1e6,
            errors
        }];
    }));
}

module.exports = { moduleRegistry, getModuleStatus };