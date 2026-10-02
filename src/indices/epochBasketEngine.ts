import { logInfo } from "../utils/log";

export interface EpochBasket {
  id: string;
  epoch: number;
  value: number;
  components: string[];
}

export class EpochBasketEngine {
  // --------------------------------------------
  // Compute epoch-weighted basket
  // --------------------------------------------
  compute(prices: Record<string, number>, epochs: Record<string, number>): EpochBasket[] {
    const buckets: Record<number, string[]> = {};

    Object.entries(epochs).forEach(([id, epoch]) => {
      if (!buckets[epoch]) buckets[epoch] = [];
      buckets[epoch].push(id);
    });

    const baskets: EpochBasket[] = Object.entries(buckets).map(([epochStr, ids]) => {
      const epoch = Number(epochStr);
      const values = ids.map((id) => prices[id] ?? 0);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      return {
        id: `epoch-${epoch}-${Date.now()}`,
        epoch,
        value: Math.round(avg),
        components: ids
      };
    });

    logInfo("Epoch baskets computed.");
    return baskets;
  }
}