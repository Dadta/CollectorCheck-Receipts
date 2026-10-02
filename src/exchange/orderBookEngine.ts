import { logInfo } from "../utils/log";

export interface Order {
  id: string;
  collectibleId: string;
  type: "bid" | "ask";
  price: number;
  quantity: number;
  timestamp: number;
}

export class OrderBookEngine {
  private bids: Order[] = [];
  private asks: Order[] = [];

  // --------------------------------------------
  // Add order to book
  // --------------------------------------------
  add(order: Order) {
    if (order.type === "bid") {
      this.bids.push(order);
      this.bids.sort((a, b) => b.price - a.price); // highest bid first
    } else {
      this.asks.push(order);
      this.asks.sort((a, b) => a.price - b.price); // lowest ask first
    }

    logInfo(`Order added: ${order.type} ${order.price}`);
  }

  // --------------------------------------------
  // Get best bid
  // --------------------------------------------
  bestBid(collectibleId: string): Order | null {
    return this.bids.find((o) => o.collectibleId === collectibleId) ?? null;
  }

  // --------------------------------------------
  // Get best ask
  // --------------------------------------------
  bestAsk(collectibleId: string): Order | null {
    return this.asks.find((o) => o.collectibleId === collectibleId) ?? null;
  }

  // --------------------------------------------
  // Retrieve full order book
  // --------------------------------------------
  getBook() {
    return {
      bids: this.bids,
      asks: this.asks
    };
  }
}