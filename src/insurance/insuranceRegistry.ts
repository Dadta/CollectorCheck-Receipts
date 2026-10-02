import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { ContinuityRatingRegistry } from "../ratings/ratingRegistry";
import { InsurancePremiumEngine, InsurancePremium } from "./premiumEngine";
import { InsuranceRiskPoolEngine } from "./riskPoolEngine";
import { logInfo } from "../utils/log";

export class ContinuityInsuranceRegistry {
  private registry: SyncRegistry;
  private market: ContinuityMarketRegistry;
  private ratings: ContinuityRatingRegistry;

  private premiumEngine = new InsurancePremiumEngine();
  private poolEngine = new InsuranceRiskPoolEngine();

  private premiums: InsurancePremium[] = [];

  constructor(registry: SyncRegistry, market: ContinuityMarketRegistry, ratings: ContinuityRatingRegistry) {
    this.registry = registry;
    this.market = market;
    this.ratings = ratings;
  }

  // --------------------------------------------
  // Recalculate insurance premiums
  // --------------------------------------------
  recalc() {
    const bundle = this.registry.buildBundle();
    const collectibles = bundle.collectibles;
    const prices = this.market.getMarket();
    const ratings = this.ratings.getRatings();

    this.premiums = collectibles.map((c: any) => {
      const price = prices[c.id] ?? 0;
      const rating = ratings.find((r) => r.collectibleId === c.id)?.rating ?? "CCC";

      const premium = this.premiumEngine.compute(c.id, price, rating);

      // Add to risk pool based on sector
      const poolId = c.sector ?? "general";
      this.poolEngine.addToPool(poolId, premium);

      return premium;
    });

    logInfo("Insurance premiums recalculated.");
  }

  getPremiums() {
    return this.premiums;
  }

  getRiskPools() {
    return this.poolEngine.getPools();
  }
}