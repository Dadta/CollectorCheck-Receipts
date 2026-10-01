const phoneburpBase = require("../modules/phoneburp-base/engine/core");
const phoneburpThinker = require("../modules/phoneburp-thinker/engine/core");
const burpfrenzy = require("../modules/burpfrenzy/engine/core");
const castlefrenzy = require("../modules/castlefrenzy/engine/core");
const hydrofrenzy = require("../modules/hydrofrenzy/engine/core");
const archivesavior = require("../modules/archivesavior/engine/core");
const collectorcheck = require("../modules/collectorcheck/engine/core");
const ditto = require("../modules/ditto/engine/core");
const dadtabus = require("../modules/dadtabus/engine/core");
const db = require("./persistence/db");

module.exports = {
    init() {
        phoneburpBase.init();
        phoneburpThinker.init();
        burpfrenzy.init();
        castlefrenzy.init();
        hydrofrenzy.init();
        archivesavior.init();
        collectorcheck.init();
        ditto.init();
        dadtabus.init();
        const data = db.load();
        if (!data.initialized) {
            data.initialized = true;
            db.save(data);
        }
        return "Continuity engine initialized with persistence";
    }
};
