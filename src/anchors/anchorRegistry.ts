import { AnchorChain } from "./anchorChain";
import { SyncRegistry } from "../sync/syncRegistry";
import { logInfo } from "../utils/log";

export class AnchorRegistry {
  private chain: AnchorChain;
  private registry: SyncRegistry;

  constructor(registry: SyncRegistry) {
    this.registry = registry;
    this.chain = new AnchorChain();
  }

  // --------------------------------------------
  // Anchor current continuity state
  // --------------------------------------------
  anchorState() {
    const bundle = this.registry.buildBundle();
    this.chain.anchor(bundle);
    logInfo("Continuity state anchored.");
  }

  // --------------------------------------------
  // Retrieve full anchor chain
  // --------------------------------------------
  getAnchors() {
    return this.chain.getChain();
  }
}