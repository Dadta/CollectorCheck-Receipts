import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { ContinuityIndexEngine, ContinuityIndex } from "./indexEngine";
import { SectorIndexEngine, SectorIndex } from "./sectorIndexEngine";
import { EpochBasketEngine, EpochBasket } from "./epochBasketEngine";
import { VolatilityIndexEngine, VolatilityIndex } from "./volatilityIndexEngine";
import { logInfo } from "../utils/log";

export class IndexRegistry {
  private registry: SyncRegistry;
  private market: ContinuityMarketRegistry;

  private indexEngine = new ContinuityIndexEngine();
  private sectorEngine = new SectorIndexEngine();
  private epochEngine = new EpochBasketEngine();
  private volEngine = new VolatilityIndexEngine();

  private composite: ContinuityIndex | null = null;
  private sectors: SectorIndex[] = [];
  private epochs: EpochBasket[] = [];
  private volatility: VolatilityIndex | null = null;

  constructor(registry: SyncRegistry, market: ContinuityMarketRegistry) {
    this.registry = registry;
    this.market = market;
  }

  // --------------------------------------------
  // Recalculate all indices
  // --------------------------------------------
  recalc() {
    const bundle = this.registry.buildBundle();
    const collectibles = bundle.collectibles;

    const prices = this.market.getMarket();

    const sectorMap: Record<string, string> = {};
    const epochMap: Record<string, number> = {};
    const history: Record<string, number[]> = {};

    collectibles.forEach((c: any) => {
      sectorMap[c.id] = c.sector ?? "general";
      epochMap[c.id] = c.epoch ?? 1;
      history[c.id] = c.priceHistory ?? [prices[c.id] ?? 0];
    });

    this.composite = this.indexEngine.compute(prices, collectibles.map((c: any) => c.id));
    this.sectors = this.sectorEngine.compute(prices, sectorMap);
    this.epochs = this.epochEngine.compute(prices, epochMap);
    this.volatility = this.volEngine.compute(prices, history);

    logInfo("All continuity indices recalculated.");
  }

  getComposite() {
    return this.composite;
  }

  getSectorIndices() {
    return this.sectors;
  }

  getEpochBaskets() {
    return this.epochs;
  }

  getVolatilityIndex() {
    return this.volatility;
  }
}