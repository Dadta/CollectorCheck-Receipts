import { logInfo } from "../utils/log";

export interface InsurancePremium {
  collectibleId: string;
  basePremium: number;
  riskAdjustedPremium: number;
  rating: string;
}

export class InsurancePremiumEngine {
  // --------------------------------------------
  // Compute base premium from market price
  // --------------------------------------------
  computeBase(price: number): number {
    return Math.round(price * 0.02); // 2% of market value
  }

  // --------------------------------------------
  // Adjust premium using credit rating
  // --------------------------------------------
  adjustForRating(base: number, rating: string): number {
    const multipliers: Record<string, number> = {
      AAA: 0.7,
      AA: 0.8,
      A: 0.9,
      BBB: 1.0,
      BB: 1.2,
      B: 1.4,
      CCC: 1.8
    };

    return Math.round(base * (multipliers[rating] ?? 1.0));
  }

  // --------------------------------------------
  // Compute full premium
  // --------------------------------------------
  compute(collectibleId: string, price: number, rating: string): InsurancePremium {
    const base = this.computeBase(price);
    const adjusted = this.adjustForRating(base, rating);

    const result: InsurancePremium = {
      collectibleId,
      basePremium: base,
      riskAdjustedPremium: adjusted,
      rating
    };

    logInfo(`Insurance premium computed for ${collectibleId}`);
    return result;
  }
}