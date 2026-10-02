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
        this.remoteProvenance = [];
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

    bindProvenance(steps, sourceNode) {
        if (!Array.isArray(steps)) throw new TypeError("Remote provenance must be an array.");
        this.remoteProvenance = steps.map(step => {
            if (!step || typeof step.actor !== "string" || !step.actor.trim() ||
                typeof step.action !== "string" || !step.action.trim() ||
                (step.payload !== undefined && (!step.payload || typeof step.payload !== "object" || Array.isArray(step.payload)))) {
                throw new TypeError("Remote provenance steps require an actor, action, and object payload.");
            }
            const timestamp = step.timestamp === undefined ? Date.now() : new Date(step.timestamp).getTime();
            if (!Number.isFinite(timestamp)) throw new TypeError("Remote provenance timestamp is invalid.");
            return {
                actor: step.actor.trim(),
                action: step.action.trim(),
                timestamp,
                payload: { ...step.payload },
                sourceNode
            };
        });
        return this.remoteProvenance;
    }

    recordContinuity(event) {
        if (!this.identity) throw new Error("Bind an identity before recording continuity.");
        return recordContinuityEvent(this.identity, event);
    }

    runPipeline(burpEvent, { sourceNode = null } = {}) {
        const startedAt = Date.now();
        const stages = [];
        const failures = [];
        function stage(module, critical, action) {
            const stageStartedAt = Date.now();
            const start = process.hrtime.bigint();
            let status = "completed";
            try {
                return action();
            } catch (error) {
                status = critical ? "failed" : "skipped";
                failures.push({ module, message: error.message });
                if (critical) {
                    if (error instanceof TypeError) {
                        error.code = "E_PIPELINE_FAIL";
                        error.stage = module;
                        throw error;
                    }
                    const failure = new Error(`${module} failed: ${error.message}`, { cause: error });
                    failure.code = "E_PIPELINE_FAIL";
                    failure.stage = module;
                    throw failure;
                }
                return null;
            } finally {
                stages.push({
                    module,
                    status,
                    startedAt: stageStartedAt,
                    completedAt: Date.now(),
                    durationMs: Number(process.hrtime.bigint() - start) / 1e6
                });
            }
        }

        stage("PhoneBurp", true, () => {
            if (!burpEvent?.id || !burpEvent.receipt ||
                burpEvent.points !== this.phoneBurp.generateBurpPoints(burpEvent.receipt)) {
                throw new TypeError("A PhoneBurp event with matching receipt and points is required.");
            }
        });
        const identity = this.identity ?? this.bindIdentity(new Identity());
        const artifact = this.artifact ?? new Artifact({ name: `Receipt: ${burpEvent.receipt.merchant}` });
        const profile = stage("CastleFrenzy", true, () => {
            const value = binder.bindPhoneBurpToCastleFrenzy(
                burpEvent, new ContinuityProfile({ identityId: identity.id })
            );
            value.recalculateContinuityScore(identity);
            return value;
        });

        const householdLedger = stage("HydroFrenzy", true, () => {
            const value = binder.bindCastleFrenzyToHydroFrenzy(
                profile, new HouseholdLedger({ householdId: identity.id })
            );
            value.dignityIndex = calculateDignityIndex(value, profile);
            return value;
        });
        const dignityIndex = householdLedger.dignityIndex;

        const archive = new Archive({ artifactId: artifact.id, identityId: identity.id });
        const archived = stage("Archive Savior", false, () => {
            archive.addProvenanceStep(createProvenanceStep("phoneburp", "receipt-ingested", {
                burpEventId: burpEvent.id
            }));
            for (const step of this.remoteProvenance) archive.addProvenanceStep({ ...step, payload: { ...step.payload } });
            binder.bindHydroFrenzyToArchiveSavior(householdLedger, archive);
            return archive;
        });
        const checked = stage("CollectorCheck", false, () => {
            if (!archived) throw new Error("Archive evidence unavailable.");
            return binder.bindArchiveSaviorToCollectorCheck(archive, artifact);
        });
        if (!checked) artifact.continuityRecord = {
            archiveId: archive.id,
            verification: { status: "unavailable", verified: false }
        };
        stage("Ditto", true, () => binder.bindCollectorCheckToDitto(artifact, identity));
        const { token, entry } = stage("Dadtabus", true, () => {
            binder.bindDittoToDadtabus(identity, this.ledger);
            profile.recalculateContinuityScore(identity, [archive]);
            return this.recordContinuity({
                type: "ritual-continuity",
                sourceModule: "phoneburp",
                amount: burpEvent.points,
                direction: "credit",
                payload: { burpEventId: burpEvent.id, artifactId: artifact.id, archiveId: archive.id, ...(sourceNode ? { sourceNode } : {}) }
            });
        });

        const completedAt = Date.now();
        const status = failures.length ? "partial" : "completed";

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
            ledger: this.ledger.exportLedger(),
            continuityEvent: {
                id: token.id,
                burpEventId: burpEvent.id,
                identityId: identity.id,
                artifactId: artifact.id,
                points: burpEvent.points,
                status,
                timestamp: token.timestamp,
                ...(sourceNode ? { sourceNode } : {})
            },
            summary: {
                status,
                startedAt,
                completedAt,
                durationMs: completedAt - startedAt,
                stages,
                failures
            }
        };
    }
}

module.exports = ContinuityOrchestrator;