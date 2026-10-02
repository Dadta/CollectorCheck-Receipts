import { OracleBase, OracleResult } from "./oracleBase";
import { logInfo } from "../utils/log";

export class InsuranceOracle extends OracleBase {
  constructor() {
    super("insurance");
  }

  async query(bundle: any): Promise<OracleResult> {
    const insured = bundle.collectibles.some((c: any) => c.provenance?.preLossEvidence);

    const result: OracleResult = {
      oracleId: this.oracleId,
      timestamp: Date.now(),
      status: insured ? "verified" : "unverified",
      details: { insuredCollectibles: insured }
    };

    logInfo("Insurance oracle responded.");
    return result;
  }
}