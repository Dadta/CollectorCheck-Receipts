const BurpEngine = require("../continuity-engine/phoneburp/burpEngine");
const { ContinuityProfile } = require("../continuity-engine/castlefrenzy");
const { HouseholdLedger, calculateDignityIndex } = require("../continuity-engine/hydrofrenzy");
const { Archive, createProvenanceStep } = require("../continuity-engine/archivesavior");
const Artifact = require("../continuity-engine/collectorcheck/models/artifact");
const Identity = require("../continuity-engine/ditto/identity");
const { ContinuityLedger, recordContinuityEvent } = require("../continuity-engine/dadtabus");
const binder = require("./moduleBinder");

class ContinuityOrchestrator {
    constructor() {
        this.phoneBurp = new BurpEngine();
        this.ledger = new ContinuityLedger();
        this.identity = null;
        this.artifact = null;
    }

    bindIdentity(identity) {
        if (!identity?.id || typeof identity.attachRecord !== "function") {
            throw new TypeError("A Ditto identity is required.");
        }
        this.identity = identity;
        return identity;
    }

    bindArtifact(artifact) {
        if (!artifact?.id || typeof artifact.name !== "string") {
            throw new TypeError("A CollectorCheck artifact is required.");
        }
        this.artifact = artifact;
        return artifact;
    }

    recordContinuity(event) {
        if (!this.identity) throw new Error("Bind an identity before recording continuity.");
        return recordContinuityEvent(this.identity, event);
    }

    runPipeline(burpEvent) {
        if (!burpEvent?.id || !burpEvent.receipt ||
            burpEvent.points !== this.phoneBurp.generateBurpPoints(burpEvent.receipt)) {
            throw new TypeError("A PhoneBurp event with matching receipt and points is required.");
        }

        const identity = this.identity ?? this.bindIdentity(new Identity());
        const artifact = this.artifact ?? new Artifact({ name: `Receipt: ${burpEvent.receipt.merchant}` });
        const profile = binder.bindPhoneBurpToCastleFrenzy(
            burpEvent, new ContinuityProfile({ identityId: identity.id })
        );
        profile.recalculateContinuityScore(identity);

        const householdLedger = binder.bindCastleFrenzyToHydroFrenzy(
            profile, new HouseholdLedger({ householdId: identity.id })
        );
        const dignityIndex = calculateDignityIndex(householdLedger, profile);
        householdLedger.dignityIndex = dignityIndex;

        const archive = new Archive({ artifactId: artifact.id, identityId: identity.id });
        archive.addProvenanceStep(createProvenanceStep("phoneburp", "receipt-ingested", {
            burpEventId: burpEvent.id
        }));
        binder.bindHydroFrenzyToArchiveSavior(householdLedger, archive);
        binder.bindArchiveSaviorToCollectorCheck(archive, artifact);
        binder.bindCollectorCheckToDitto(artifact, identity);
        binder.bindDittoToDadtabus(identity, this.ledger);
        profile.recalculateContinuityScore(identity, [archive]);

        const { token, entry } = this.recordContinuity({
            type: "ritual-continuity",
            sourceModule: "phoneburp",
            amount: burpEvent.points,
            direction: "credit",
            payload: { burpEventId: burpEvent.id, artifactId: artifact.id, archiveId: archive.id }
        });

        return {
            burpEvent,
            profile,
            householdLedger,
            dignityIndex,
            archive,
            artifact,
            verification: artifact.continuityRecord.verification,
            identity,
            token,
            entry,
            ledger: this.ledger.exportLedger()
        };
    }
}

module.exports = ContinuityOrchestrator;