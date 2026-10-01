# HydroFrenzy

HydroFrenzy is the household dignity engine. It tracks household utility continuity, records continuity events, calculates a transparent household dignity index, and prepares outage response plans.

## Module Flow

HydroFrenzy consumes household-relevant identity and continuity context from Ditto and the continuity profile and risk assessment produced by CastleFrenzy. It evaluates utility coverage and documented events alongside that identity continuity. Household utility changes and outage-response activity can then feed PhoneBurp as continuity signals, where related bills, receipts, and response records can be ingested into the wider pipeline.

## Starter API

- `householdLedger.js` exports the household ledger model.
- `utilityAccount.js` exports `createUtilityAccount(payload)`.
- `dignityIndex.js` exports `calculateDignityIndex(householdLedger, continuityProfile)`.
- `outagePlanner.js` exports `generateOutagePlan(householdLedger)` for power, water, and connectivity.
- `index.js` exposes these APIs from one entry point.