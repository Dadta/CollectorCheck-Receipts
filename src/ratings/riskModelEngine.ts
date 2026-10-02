import { logInfo } from "../utils/log";

export interface ContinuityRiskScore {
  collectibleId: string;
  score: number; // 0–100
  components: {
    volatility: number;
    provenance: number;
    identity: number;
    oracleTruth: number;
    marketStability: number;
    epochMaturity: number;
  };
}

export class RiskModelEngine {
  // --------------------------------------------
  // Compute risk score from multiple components
  // --------------------------------------------
  compute(
    collectibleId: string,
    volatility: number,
    provenance: number,
    identity: number,
    oracleTruth: number,
    marketStability: number,
    epochMaturity: number
  ): ContinuityRiskScore {
    // Weighted risk model
    const score =
      volatility * 0.25 +
      provenance * 0.2 +
      identity * 0.15 +
      oracleTruth * 0.15 +
      marketStability * 0.15 +
      epochMaturity * 0.1;

    const result: ContinuityRiskScore = {
      collectibleId,
      score: Math.round(score),
      components: {
        volatility,
        provenance,
        identity,
        oracleTruth,
        marketStability,
        epochMaturity
      }
    };

    logInfo(`Risk score computed for ${collectibleId}`);
    return result;
  }
}