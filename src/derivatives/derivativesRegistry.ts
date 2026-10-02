import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { ContinuityFuturesEngine, ContinuityFuture } from "./futuresEngine";
import { ContinuityOptionsEngine, ContinuityOption } from "./optionsEngine";
import { logInfo } from "../utils/log";

export class ContinuityDerivativesRegistry {
  private registry: SyncRegistry;
  private market: ContinuityMarketRegistry;
  private futuresEngine: ContinuityFuturesEngine;
  private optionsEngine: ContinuityOptionsEngine;

  private futures: ContinuityFuture[] = [];
  private options: ContinuityOption[] = [];

  constructor(registry: SyncRegistry, market: ContinuityMarketRegistry) {
    this.registry = registry;
    this.market = market;
    this.futuresEngine = new ContinuityFuturesEngine();
    this.optionsEngine = new ContinuityOptionsEngine();
  }

  // --------------------------------------------
  // Recalculate derivatives for all collectibles
  // --------------------------------------------
  recalc() {
    const collectibles = this.registry.buildBundle().collectibles;

    collectibles.forEach((c: any) => {
      const spot = this.market.getPrice(c.id) ?? 100;
      const epoch = c.epoch ?? 1;

      const future = this.futuresEngine.compute(spot, epoch);
      future.collectibleId = c.id;

      const call = this.optionsEngine.compute("call", spot, spot * 1.1, epoch);
      call.collectibleId = c.id;

      const put = this.optionsEngine.compute("put", spot, spot * 0.9, epoch);
      put.collectibleId = c.id;

      this.futures.push(future);
      this.options.push(call);
      this.options.push(put);
    });

    logInfo("Derivatives recalculated.");
  }

  getFutures() {
    return this.futures;
  }

  getOptions() {
    return this.options;
  }
}