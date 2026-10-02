import { TrustWeightEngine } from "./trustWeightEngine";
import { OracleManager } from "../oracles/oracleManager";
import { logInfo } from "../utils/log";

export class OracleWeightRegistry {
  private engine: TrustWeightEngine;
  private oracles: OracleManager;

  constructor(oracles: OracleManager) {
    this.oracles = oracles;
    this.engine = new TrustWeightEngine();
  }

  // --------------------------------------------
  // Run oracles and update trust weights
  // --------------------------------------------
  async updateWeights() {
    await this.oracles.runAll();
    const results = this.oracles.getResults();
    this.engine.apply(results);
    logInfo("Oracle-driven trust weights applied.");
  }

  getWeights() {
    return this.engine.getWeights();
  }
}