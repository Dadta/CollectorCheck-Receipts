# Epoch Continuity Seals

Epoch Continuity Seals provide signature-based attestation for continuity state.

## What Seals Guarantee
- multi-authority signing
- cryptographic attestation
- insurance-grade trust
- CollectorCheck verification signatures
- DadtaBus identity seals
- cross-region trust bundles

## How It Works
1. Continuity bundle is hashed (SHA-256)
2. Authorities sign the hash using HMAC-SHA256
3. Seals are stored and propagated across federation

## Authorities
- collectorcheck
- dadtabus
- future authorities (insurance, valuation engines)

## Integration
- FederationMesh (seals on packet receive)
- SyncRegistry (provides continuity bundle)
- ConsensusEngine (ensures consistent state before sealing)
- AnchorRegistry (provides hash-chain anchoring)

## Notes
- Seals complement anchors: anchors secure history, seals secure authority.