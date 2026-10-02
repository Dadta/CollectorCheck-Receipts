import crypto from "crypto";
import { logInfo } from "../utils/log";

export interface Seal {
  authorityId: string;
  timestamp: number;
  signature: string;
  payloadHash: string;
}

export class SealAuthority {
  private authorityId: string;
  private privateKey: string;

  constructor(authorityId: string) {
    this.authorityId = authorityId;
    this.privateKey = crypto.randomBytes(32).toString("hex");
  }

  // --------------------------------------------
  // Sign a payload hash
  // --------------------------------------------
  sign(payloadHash: string): Seal {
    const timestamp = Date.now();
    const data = `${this.authorityId}:${timestamp}:${payloadHash}`;

    const signature = crypto
      .createHmac("sha256", this.privateKey)
      .update(data)
      .digest("hex");

    const seal: Seal = {
      authorityId: this.authorityId,
      timestamp,
      signature,
      payloadHash
    };

    logInfo(`Seal created by ${this.authorityId}`);
    return seal;
  }

  // --------------------------------------------
  // Verify a seal
  // --------------------------------------------
  verify(seal: Seal): boolean {
    const data = `${seal.authorityId}:${seal.timestamp}:${seal.payloadHash}`;

    const expected = crypto
      .createHmac("sha256", this.privateKey)
      .update(data)
      .digest("hex");

    return expected === seal.signature;
  }
}