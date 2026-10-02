# Epoch Continuity Anchors

Epoch Continuity Anchors provide cryptographic provenance for continuity state.

## What Anchors Guarantee
- tamper-evident continuity history
- hash-chain verification
- cross-node trust
- insurance-grade provenance
- CollectorCheck auditability
- DadtaBus identity continuity

## How It Works
Each continuity snapshot is:
1. serialized
2. hashed (SHA-256)
3. linked to the previous block
4. added to the anchor chain

This forms a cryptographic hash-chain.

## Integration
- FederationMesh (anchors on packet receive)
- SyncRegistry (provides continuity bundle)
- ConsensusEngine (ensures consistent state before anchoring)

## Notes
- Anchors do not replace consensus; they secure it.
- Designed for global provenance and insurance alignment.