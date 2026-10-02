import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { IndexRegistry } from "../indices/indexRegistry";
import { RiskModelEngine, ContinuityRiskScore } from "./riskModelEngine";
import { RatingEngine, ContinuityRating } from "./ratingEngine";
import { logInfo } from "../utils/log";

export class ContinuityRatingRegistry {
  private registry: SyncRegistry;
  private market: ContinuityMarketRegistry;
  private indices: IndexRegistry;

  private riskModel = new RiskModelEngine();
  private ratingEngine = new RatingEngine();

  private ratings: ContinuityRating[] = [];

  constructor(registry: SyncRegistry, market: ContinuityMarketRegistry, indices: IndexRegistry) {
    this.registry = registry;
    this.market = market;
    this.indices = indices;
  }

  // --------------------------------------------
  // Recalculate ratings for all collectibles
  // --------------------------------------------
  recalc() {
    const bundle = this.registry.buildBundle();
    const collectibles = bundle.collectibles;
    const prices = this.market.getMarket();

    const volatilityIndex = this.indices.getVolatilityIndex();
    const compositeIndex = this.indices.getComposite();

    this.ratings = collectibles.map((c: any) => {
      const volatility = volatilityIndex?.value ?? 0;
      const provenance = c.provenance?.strength ?? 50;
      const identity = c.identityContinuity ?? 50;
      const oracleTruth = c.verification?.verified ? 90 : 40;
      const marketStability = compositeIndex?.value ?? 50;
      const epochMaturity = c.epoch ?? 1;

      const riskScore: ContinuityRiskScore = this.riskModel.compute(
        c.id,
        volatility,
        provenance,
        identity,
        oracleTruth,
        marketStability,
        epochMaturity
      );

      return this.ratingEngine.rate(riskScore);
    });

    logInfo("Continuity ratings recalculated.");
  }

  getRatings() {
    return this.ratings;
  }
}