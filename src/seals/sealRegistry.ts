import { SealAuthority, Seal } from "./sealAuthority";
import { SyncRegistry } from "../sync/syncRegistry";
import crypto from "crypto";
import { logInfo } from "../utils/log";

export class SealRegistry {
  private authorities: Map<string, SealAuthority> = new Map();
  private seals: Seal[] = [];
  private registry: SyncRegistry;

  constructor(registry: SyncRegistry) {
    this.registry = registry;
  }

  // --------------------------------------------
  // Register a new signing authority
  // --------------------------------------------
  addAuthority(authorityId: string) {
    const auth = new SealAuthority(authorityId);
    this.authorities.set(authorityId, auth);
    logInfo(`Seal authority registered: ${authorityId}`);
  }

  // --------------------------------------------
  // Produce a seal for the current continuity state
  // --------------------------------------------
  seal(authorityId: string) {
    const auth = this.authorities.get(authorityId);
    if (!auth) return null;

    const bundle = this.registry.buildBundle();
    const payloadHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(bundle))
      .digest("hex");

    const seal = auth.sign(payloadHash);
    this.seals.push(seal);

    logInfo(`Continuity sealed by ${authorityId}`);
    return seal;
  }

  // --------------------------------------------
  // Retrieve all seals
  // --------------------------------------------
  getSeals() {
    return this.seals;
  }
}