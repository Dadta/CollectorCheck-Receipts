import { SyncRegistry } from "../sync/syncRegistry";
import { MarketCurveEngine } from "./marketCurveEngine";
import { MarketPriceEngine } from "./marketPriceEngine";
import { OracleWeightRegistry } from "../weights/oracleWeightRegistry";
import { logInfo } from "../utils/log";

export class ContinuityMarketRegistry {
  private registry: SyncRegistry;
  private curves: MarketCurveEngine;
  private pricing: MarketPriceEngine;
  private weights: OracleWeightRegistry;
  private market: Record<string, number> = {};

  constructor(registry: SyncRegistry, weights: OracleWeightRegistry) {
    this.registry = registry;
    this.curves = new MarketCurveEngine();
    this.pricing = new MarketPriceEngine();
    this.weights = weights;
  }

  // --------------------------------------------
  // Recalculate market prices for all collectibles
  // --------------------------------------------
  recalc() {
    const bundle = this.registry.buildBundle();
    const collectibles = bundle.collectibles;

    const totalSupply = collectibles.length;
    const verifiedCount = collectibles.filter((c: any) => c.verification?.verified).length;

    const curves = this.curves.compute(totalSupply, verifiedCount);
    const trust = this.weights.getWeights();

    collectibles.forEach((c: any) => {
      const baseContinuity = c.continuityScore ?? 0;
      const price = this.pricing.compute(baseContinuity, curves, trust);
      this.market[c.id] = price;
    });

    logInfo("Market recalculated.");
  }

  // --------------------------------------------
  // Retrieve market price
  // --------------------------------------------
  getPrice(id: string): number | null {
    return this.market[id] ?? null;
  }

  // --------------------------------------------
  // Retrieve full market
  // --------------------------------------------
  getMarket() {
    return this.market;
  }
}