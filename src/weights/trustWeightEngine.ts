import { OracleResult } from "../oracles/oracleBase";
import { logInfo } from "../utils/log";

export interface TrustWeights {
  collectorcheck: number;
  dadtabus: number;
  insurance: number;
}

export class TrustWeightEngine {
  private weights: TrustWeights = {
    collectorcheck: 1.0,
    dadtabus: 1.0,
    insurance: 1.0
  };

  // --------------------------------------------
  // Apply oracle results to adjust trust weights
  // --------------------------------------------
  apply(results: OracleResult[]) {
    for (const r of results) {
      switch (r.oracleId) {
        case "collectorcheck":
          this.weights.collectorcheck = r.status === "verified" ? 1.2 : 0.9;
          break;

        case "dadtabus":
          this.weights.dadtabus = r.status === "verified" ? 1.15 : 0.85;
          break;

        case "insurance":
          this.weights.insurance = r.status === "verified" ? 1.25 : 0.8;
          break;
      }
    }

    logInfo("Trust weights updated from oracle results.");
  }

  // --------------------------------------------
  // Retrieve current weights
  // --------------------------------------------
  getWeights(): TrustWeights {
    return this.weights;
  }
}