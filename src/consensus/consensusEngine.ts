import { ContinuityCRDT } from "./continuityCRDT";
import { SyncRegistry } from "../sync/syncRegistry";
import { logInfo } from "../utils/log";

export class ConsensusEngine {
  private crdt = new ContinuityCRDT();
  private registry: SyncRegistry;

  constructor(registry: SyncRegistry) {
    this.registry = registry;
  }

  // Apply CRDT merge between local and incoming state
  resolve(incoming: any) {
    const local = this.registry.buildBundle();

    const merged = {
      collectibles: this.crdt.mergeCollectibles(local.collectibles, incoming.collectibles),
      ledger: this.crdt.mergeLedger(local.ledger, incoming.ledger),
      meta: this.crdt.mergeMeta(local.meta, incoming.meta)
    };

    this.registry.apply(merged);

    logInfo("Consensus resolution applied.");
  }
}