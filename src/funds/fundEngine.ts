import { logInfo } from "../utils/log";

export interface FundPosition {
  collectibleId: string;
  weight: number;
  price: number;
  value: number;
}

export interface ContinuityFund {
  id: string;
  name: string;
  nav: number;
  positions: FundPosition[];
}

export class FundEngine {
  // --------------------------------------------
  // Compute NAV from weighted positions
  // --------------------------------------------
  compute(name: string, prices: Record<string, number>, weights: Record<string, number>): ContinuityFund {
    const positions: FundPosition[] = Object.entries(weights).map(([id, w]) => {
      const price = prices[id] ?? 0;
      return {
        collectibleId: id,
        weight: w,
        price,
        value: price * w
      };
    });

    const nav = positions.reduce((a, p) => a + p.value, 0);

    const fund: ContinuityFund = {
      id: `fund-${Date.now()}`,
      name,
      nav: Math.round(nav),
      positions
    };

    logInfo(`Fund NAV computed: ${name}`);
    return fund;
  }
}