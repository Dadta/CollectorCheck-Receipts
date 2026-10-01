const { createSnapshot } = require("../continuity-engine/archivesavior");
const { bindProvenance } = require("../continuity-engine/ditto/provenanceBinder");
const { bindIdentityToLedger } = require("../continuity-engine/dadtabus");

function bindPhoneBurpToCastleFrenzy(burpEvent, continuityProfile) {
    if (!burpEvent?.id || !Number.isSafeInteger(burpEvent.points) || burpEvent.points < 0 ||
        typeof continuityProfile?.updateRiskProfile !== "function") {
        throw new TypeError("A BurpEvent and CastleFrenzy profile are required.");
    }
    continuityProfile.updateRiskProfile({ burpEventId: burpEvent.id, burpPoints: burpEvent.points });
    return continuityProfile;
}

function bindCastleFrenzyToHydroFrenzy(profile, householdLedger) {
    if (!profile?.id || typeof householdLedger?.recordEvent !== "function") {
        throw new TypeError("A CastleFrenzy profile and HydroFrenzy ledger are required.");
    }
    householdLedger.recordEvent({
        type: "castle-continuity",
        profileId: profile.id,
        burpEventId: profile.riskProfile.burpEventId,
        continuityScore: profile.continuityScore?.score ?? null
    });
    return householdLedger;
}

function bindHydroFrenzyToArchiveSavior(householdLedger, archive) {
    if (typeof householdLedger?.getHouseholdSummary !== "function" ||
        typeof archive?.addSnapshot !== "function") {
        throw new TypeError("A HydroFrenzy ledger and Archive Savior archive are required.");
    }
    archive.addSnapshot(createSnapshot("household-continuity", {
        household: householdLedger.getHouseholdSummary(),
        dignityIndex: householdLedger.dignityIndex ?? null
    }));
    return archive;
}

function bindArchiveSaviorToCollectorCheck(archive, artifact) {
    if (!archive?.id || !Array.isArray(archive.continuitySnapshots) || !artifact?.id) {
        throw new TypeError("An Archive Savior archive and CollectorCheck artifact are required.");
    }
    artifact.provenance = [...archive.provenanceChain];
    artifact.continuityRecord = {
        archiveId: archive.id,
        snapshotCount: archive.continuitySnapshots.length,
        verification: { status: "placeholder", verified: false }
    };
    return artifact;
}

function bindCollectorCheckToDitto(artifact, identity) {
    if (!artifact?.id || typeof identity?.attachRecord !== "function") {
        throw new TypeError("A CollectorCheck artifact and Ditto identity are required.");
    }
    bindProvenance(identity, artifact);
    identity.attachRecord({
        id: artifact.id,
        type: "artifact",
        archiveId: artifact.continuityRecord?.archiveId ?? null,
        verification: artifact.continuityRecord?.verification ?? null
    });
    return identity;
}

function bindDittoToDadtabus(identity, ledger) {
    return bindIdentityToLedger(identity, ledger);
}

module.exports = {
    bindPhoneBurpToCastleFrenzy,
    bindCastleFrenzyToHydroFrenzy,
    bindHydroFrenzyToArchiveSavior,
    bindArchiveSaviorToCollectorCheck,
    bindCollectorCheckToDitto,
    bindDittoToDadtabus
};