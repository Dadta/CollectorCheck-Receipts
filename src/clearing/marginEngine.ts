import { ContinuityRating } from "../ratings/ratingEngine";
import { logInfo } from "../utils/log";

export interface MarginRequirement {
  collectibleId: string;
  rating: string;
  margin: number;
}

export class MarginEngine {
  // --------------------------------------------
  // Compute margin requirement based on rating
  // --------------------------------------------
  compute(rating: ContinuityRating): MarginRequirement {
    const multipliers: Record<string, number> = {
      AAA: 0.05,
      AA: 0.07,
      A: 0.1,
      BBB: 0.15,
      BB: 0.2,
      B: 0.25,
      CCC: 0.35
    };

    const margin = multipliers[rating.rating] ?? 0.4;

    const result: MarginRequirement = {
      collectibleId: rating.collectibleId,
      rating: rating.rating,
      margin
    };

    logInfo(`Margin computed for ${rating.collectibleId}`);
    return result;
  }
}