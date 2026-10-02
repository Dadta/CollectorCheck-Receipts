import { Trade } from "../exchange/tradeMatchingEngine";
import { logInfo } from "../utils/log";

export interface SettlementRecord {
  settlementId: string;
  tradeId: string;
  collectibleId: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export class SettlementEngine {
  // --------------------------------------------
  // Convert trades → settlement records
  // --------------------------------------------
  settle(trades: Trade[]): SettlementRecord[] {
    const settlements = trades.map((t) => ({
      settlementId: `settle-${Date.now()}-${t.tradeId}`,
      tradeId: t.tradeId,
      collectibleId: t.collectibleId,
      price: t.price,
      quantity: t.quantity,
      timestamp: Date.now()
    }));

    logInfo("Trades settled.");
    return settlements;
  }
}