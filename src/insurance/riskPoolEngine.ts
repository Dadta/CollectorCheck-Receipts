import { InsurancePremium } from "./premiumEngine";
import { logInfo } from "../utils/log";

export interface RiskPool {
  poolId: string;
  totalPremiums: number;
  insuredItems: string[];
}

export class InsuranceRiskPoolEngine {
  private pools: RiskPool[] = [];

  // --------------------------------------------
  // Add premium to risk pool
  // --------------------------------------------
  addToPool(poolId: string, premium: InsurancePremium) {
    let pool = this.pools.find((p) => p.poolId === poolId);

    if (!pool) {
      pool = {
        poolId,
        totalPremiums: 0,
        insuredItems: []
      };
      this.pools.push(pool);
    }

    pool.totalPremiums += premium.riskAdjustedPremium;
    pool.insuredItems.push(premium.collectibleId);

    logInfo(`Premium added to pool ${poolId}`);
  }

  getPools() {
    return this.pools;
  }
}