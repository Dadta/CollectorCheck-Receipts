import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { OrderBookEngine, Order } from "./orderBookEngine";
import { TradeMatchingEngine } from "./tradeMatchingEngine";
import { logInfo } from "../utils/log";

export class ContinuityExchangeRegistry {
  private registry: SyncRegistry;
  private market: ContinuityMarketRegistry;
  private book: OrderBookEngine;
  private matcher: TradeMatchingEngine;

  constructor(registry: SyncRegistry, market: ContinuityMarketRegistry) {
    this.registry = registry;
    this.market = market;
    this.book = new OrderBookEngine();
    this.matcher = new TradeMatchingEngine(this.book);
  }

  // --------------------------------------------
  // Seed order book with synthetic bids/asks
  // --------------------------------------------
  seed() {
    const collectibles = this.registry.buildBundle().collectibles;

    collectibles.forEach((c: any) => {
      const price = this.market.getPrice(c.id) ?? 100;

      const bid: Order = {
        id: `bid-${c.id}`,
        collectibleId: c.id,
        type: "bid",
        price: Math.round(price * 0.95),
        quantity: 1,
        timestamp: Date.now()
      };

      const ask: Order = {
        id: `ask-${c.id}`,
        collectibleId: c.id,
        type: "ask",
        price: Math.round(price * 1.05),
        quantity: 1,
        timestamp: Date.now()
      };

      this.book.add(bid);
      this.book.add(ask);
    });

    logInfo("Exchange seeded with synthetic orders.");
  }

  // --------------------------------------------
  // Run matching engine
  // --------------------------------------------
  matchAll() {
    const collectibles = this.registry.buildBundle().collectibles;
    collectibles.forEach((c: any) => this.matcher.match(c.id));
    logInfo("Exchange matching executed.");
  }

  getOrderBook() {
    return this.book.getBook();
  }

  getTrades() {
    return this.matcher.getTrades();
  }
}