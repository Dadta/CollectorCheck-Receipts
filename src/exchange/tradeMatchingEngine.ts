import { OrderBookEngine, Order } from "./orderBookEngine";
import { logInfo } from "../utils/log";

export interface Trade {
  tradeId: string;
  collectibleId: string;
  price: number;
  quantity: number;
  bidOrderId: string;
  askOrderId: string;
  timestamp: number;
}

export class TradeMatchingEngine {
  private book: OrderBookEngine;
  private trades: Trade[] = [];

  constructor(book: OrderBookEngine) {
    this.book = book;
  }

  // --------------------------------------------
  // Attempt to match orders
  // --------------------------------------------
  match(collectibleId: string) {
    const bid = this.book.bestBid(collectibleId);
    const ask = this.book.bestAsk(collectibleId);

    if (!bid || !ask) return;
    if (bid.price < ask.price) return; // no match

    const quantity = Math.min(bid.quantity, ask.quantity);
    const price = ask.price; // ask price wins

    const trade: Trade = {
      tradeId: `trade-${Date.now()}`,
      collectibleId,
      price,
      quantity,
      bidOrderId: bid.id,
      askOrderId: ask.id,
      timestamp: Date.now()
    };

    this.trades.push(trade);

    bid.quantity -= quantity;
    ask.quantity -= quantity;

    logInfo(`Trade executed: ${price} x ${quantity}`);
  }

  getTrades() {
    return this.trades;
  }
}