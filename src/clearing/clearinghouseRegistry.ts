import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { ContinuityRatingRegistry } from "../ratings/ratingRegistry";
import { ContinuityExchangeRegistry } from "../exchange/continuityExchangeRegistry";
import { SettlementEngine, SettlementRecord } from "./settlementEngine";
import { MarginEngine, MarginRequirement } from "./marginEngine";
import { CollateralEngine, CollateralRecord } from "./collateralEngine";
import { logInfo } from "../utils/log";

export class ContinuityClearinghouseRegistry {
  private registry: SyncRegistry;
  private market: ContinuityMarketRegistry;
  private ratings: ContinuityRatingRegistry;
  private exchange: ContinuityExchangeRegistry;

  private settlementEngine = new SettlementEngine();
  private marginEngine = new MarginEngine();
  private collateralEngine = new CollateralEngine();

  private settlements: SettlementRecord[] = [];
  private margins: MarginRequirement[] = [];
  private collateral: CollateralRecord[] = [];

  constructor(registry: SyncRegistry, market: ContinuityMarketRegistry, ratings: ContinuityRatingRegistry, exchange: ContinuityExchangeRegistry) {
    this.registry = registry;
    this.market = market;
    this.ratings = ratings;
    this.exchange = exchange;
  }

  // --------------------------------------------
  // Recalculate clearinghouse state
  // --------------------------------------------
  recalc() {
    const trades = this.exchange.getTrades();
    const prices = this.market.getMarket();
    const ratings = this.ratings.getRatings();

    // Settlement
    this.settlements = this.settlementEngine.settle(trades);

    // Margin
    this.margins = ratings.map((r) => this.marginEngine.compute(r));

    // Collateral
    this.collateral = this.margins.map((m) => {
      const price = prices[m.collectibleId] ?? 0;
      return this.collateralEngine.compute(price, m);
    });

    logInfo("Clearinghouse recalculated.");
  }

  getSettlements() {
    return this.settlements;
  }

  getMargins() {
    return this.margins;
  }

  getCollateral() {
    return this.collateral;
  }
}