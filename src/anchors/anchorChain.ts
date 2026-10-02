import crypto from "crypto";
import { logInfo, logWarn } from "../utils/log";

export interface AnchorBlock {
  index: number;
  timestamp: number;
  payloadHash: string;
  prevHash: string;
  hash: string;
}

export class AnchorChain {
  private chain: AnchorBlock[] = [];

  constructor() {
    this.createGenesis();
  }

  private createGenesis() {
    const genesis: AnchorBlock = {
      index: 0,
      timestamp: Date.now(),
      payloadHash: "0",
      prevHash: "0",
      hash: this.computeHash(0, "0", "0", Date.now())
    };

    this.chain.push(genesis);
    logInfo("Anchor genesis block created.");
  }

  private computeHash(index: number, payloadHash: string, prevHash: string, timestamp: number) {
    const data = `${index}:${timestamp}:${payloadHash}:${prevHash}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // --------------------------------------------
  // Add new anchored block
  // --------------------------------------------
  anchor(payload: any) {
    try {
      const payloadHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(payload))
        .digest("hex");

      const prev = this.chain[this.chain.length - 1];
      const index = prev.index + 1;
      const timestamp = Date.now();

      const hash = this.computeHash(index, payloadHash, prev.hash, timestamp);

      const block: AnchorBlock = {
        index,
        timestamp,
        payloadHash,
        prevHash: prev.hash,
        hash
      };

      this.chain.push(block);
      logInfo(`Anchor block added (#${index}).`);
    } catch {
      logWarn("Failed to anchor payload.");
    }
  }

  getChain() {
    return this.chain;
  }
}