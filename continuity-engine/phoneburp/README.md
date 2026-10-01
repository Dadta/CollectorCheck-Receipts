# PhoneBurp

PhoneBurp is the ritual ignition layer of the continuity system. It turns a receipt into a BurpEvent and credits BurpPoints, creating a starting signal for downstream continuity work.

`receiptParser.js` accepts `merchant`/`total` or the existing `vendor`/`amount` receipt fields, along with an optional timestamp and category. `burpEngine.js` parses the receipt, awards one point per whole unit of its total, creates a BurpEvent, and stores it in an in-memory `burpLedger.js`. This starter ledger does not persist events across process restarts.

`ritualBinder.js` attaches the event to a Ditto identity as a continuity record and credits its points to a Dadtabus continuity ledger. These bindings are explicit; ingesting a receipt alone does not mutate either downstream system.

The continuity path begins here: PhoneBurp feeds CastleFrenzy with the initial household signal, then HydroFrenzy with utility context, CollectorCheck with verified artifacts, Ditto with identity continuity, and Dadtabus with ledger credit. The starter engine emits the event for those handoffs; it does not automatically run the downstream modules.

```js
const BurpEngine = require("./burpEngine");
const { bindBurpToIdentity, bindBurpToLedger } = require("./ritualBinder");

const engine = new BurpEngine();
const event = engine.ingestReceipt({ merchant: "Corner Store", total: 12.75, category: "groceries" });
// bindBurpToIdentity(dittoIdentity, event);
// bindBurpToLedger(dadtabusLedger, event);
```