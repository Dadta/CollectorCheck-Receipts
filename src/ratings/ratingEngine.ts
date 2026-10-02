import { ContinuityRiskScore } from "./riskModelEngine";
import { logInfo } from "../utils/log";

export interface ContinuityRating {
  collectibleId: string;
  rating: string; // AAA–CCC
  riskScore: number;
}

export class RatingEngine {
  // --------------------------------------------
  // Map risk score → credit rating
  // --------------------------------------------
  rate(score: ContinuityRiskScore): ContinuityRating {
    const s = score.score;

    let rating = "CCC";
    if (s >= 90) rating = "AAA";
    else if (s >= 80) rating = "AA";
    else if (s >= 70) rating = "A";
    else if (s >= 60) rating = "BBB";
    else if (s >= 50) rating = "BB";
    else if (s >= 40) rating = "B";
    else if (s >= 30) rating = "CCC";

    const result: ContinuityRating = {
      collectibleId: score.collectibleId,
      rating,
      riskScore: score.score
    };

    logInfo(`Rating assigned: ${score.collectibleId} → ${rating}`);
    return result;
  }
}