import { MarginRequirement } from "./marginEngine";
import { logInfo } from "../utils/log";

export interface CollateralRecord {
  collectibleId: string;
  requiredCollateral: number;
  postedCollateral: number;
  deficit: number;
}

export class CollateralEngine {
  // --------------------------------------------
  // Compute collateral requirement from margin + price
  // --------------------------------------------
  compute(price: number, margin: MarginRequirement): CollateralRecord {
    const required = Math.round(price * margin.margin);
    const posted = Math.round(required * 0.9); // synthetic: 90% posted
    const deficit = required - posted;

    const record: CollateralRecord = {
      collectibleId: margin.collectibleId,
      requiredCollateral: required,
      postedCollateral: posted,
      deficit
    };

    logInfo(`Collateral computed for ${margin.collectibleId}`);
    return record;
  }
}