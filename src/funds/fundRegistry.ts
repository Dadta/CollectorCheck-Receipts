import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { IndexRegistry } from "../indices/indexRegistry";
import { FundEngine, ContinuityFund } from "./fundEngine";
import { FundStrategyEngine } from "./fundStrategyEngine";
import { logInfo } from "../utils/log";

export class ContinuityFundRegistry {
  private registry: SyncRegistry;
  private market: ContinuityMarketRegistry;
  private indices: IndexRegistry;

  private engine = new FundEngine();
  private strategy = new FundStrategyEngine();

  private funds: ContinuityFund[] = [];

  constructor(registry: SyncRegistry, market: ContinuityMarketRegistry, indices: IndexRegistry) {
    this.registry = registry;
    this.market = market;
    this.indices = indices;
  }

  // --------------------------------------------
  // Recalculate all funds
  // --------------------------------------------
  recalc() {
    const bundle = this.registry.buildBundle();
    const collectibles = bundle.collectibles;
    const prices = this.market.getMarket();

    const ids = collectibles.map((c: any) => c.id);
    const sectorMap: Record<string, string> = {};
    const epochMap: Record<string, number> = {};

    collectibles.forEach((c: any) => {
      sectorMap[c.id] = c.sector ?? "general";
      epochMap[c.id] = c.epoch ?? 1;
    });

    // Equal-weight ETF
    const eqWeights = this.strategy.equalWeight(ids);
    const eqFund = this.engine.compute("ECF Equal-Weight", prices, eqWeights);

    // Sector-weight ETF (general overweight)
    const secWeights = this.strategy.sectorWeight(ids, sectorMap, "general");
    const secFund = this.engine.compute("ECF Sector-Overweight", prices, secWeights);

    // Epoch-weight ETF
    const epWeights = this.strategy.epochWeight(ids, epochMap);
    const epFund = this.engine.compute("ECF Epoch-Weighted", prices, epWeights);

    this.funds = [eqFund, secFund, epFund];

    logInfo("Continuity funds recalculated.");
  }

  getFunds() {
    return this.funds;
  }
}