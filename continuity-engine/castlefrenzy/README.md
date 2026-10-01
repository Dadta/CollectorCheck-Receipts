# CastleFrenzy

CastleFrenzy is the identity continuity engine above Ditto. Ditto provides the identity substrate and bound continuity records; CastleFrenzy evaluates that identity together with household context and Archive Savior records to maintain a continuity profile and plan for potential loss.

## Module Flow

CastleFrenzy consumes identity and continuity data from Ditto, along with provenance chains and continuity snapshots from Archive Savior. Its evaluator returns a structured continuity score and breakdown. That profile and its household context can inform HydroFrenzy's household continuity workflows, such as prioritizing household records, risk mitigation, and recovery preparation.

## Starter API

- `continuityProfile.js` exports the profile model and score/summary methods.
- `householdContext.js` exports `createHouseholdContext(payload)`.
- `continuityEvaluator.js` exports `evaluateContinuity(identity, householdContext, archives)`.
- `escalationPlanner.js` exports `generatePlan(identity, continuityProfile)` with pre-loss, incident, and post-loss phases.