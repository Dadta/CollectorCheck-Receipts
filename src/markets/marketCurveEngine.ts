import { logInfo } from "../utils/log";

export interface MarketCurves {
  rarityCurve: number;
  demandCurve: number;
  supplyCurve: number;
}

export class MarketCurveEngine {
  // --------------------------------------------
  // Compute rarity curve (rarity → price multiplier)
  // --------------------------------------------
  computeRarityCurve(totalSupply: number): number {
    if (totalSupply <= 1) return 2.0;      // ultra rare
    if (totalSupply <= 10) return 1.5;     // rare
    if (totalSupply <= 100) return 1.2;    // uncommon
    return 1.0;                            // common
  }

  // --------------------------------------------
  // Compute demand curve (oracle truth → demand)
  // --------------------------------------------
  computeDemandCurve(verifiedCount: number): number {
    if (verifiedCount > 50) return 1.3;
    if (verifiedCount > 10) return 1.15;
    if (verifiedCount > 0) return 1.05;
    return 1.0;
  }

  // --------------------------------------------
  // Compute supply curve (supply pressure → price)
  // --------------------------------------------
  computeSupplyCurve(totalSupply: number): number {
    if (totalSupply > 1000) return 0.85;   // oversupply
    if (totalSupply > 500) return 0.9;
    if (totalSupply > 100) return 0.95;
    return 1.0;
  }

  // --------------------------------------------
  // Compute all curves
  // --------------------------------------------
  compute(totalSupply: number, verifiedCount: number): MarketCurves {
    const curves = {
      rarityCurve: this.computeRarityCurve(totalSupply),
      demandCurve: this.computeDemandCurve(verifiedCount),
      supplyCurve: this.computeSupplyCurve(totalSupply)
    };

    logInfo("Market curves computed.");
    return curves;
  }
}