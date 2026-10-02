import { MarketCurves } from "./marketCurveEngine";
import { TrustWeights } from "../weights/trustWeightEngine";
import { logInfo } from "../utils/log";

export class MarketPriceEngine {
  // --------------------------------------------
  // Compute final market price
  // --------------------------------------------
  compute(baseContinuity: number, curves: MarketCurves, weights: TrustWeights): number {
    const {
      rarityCurve,
      demandCurve,
      supplyCurve
    } = curves;

    const {
      collectorcheck,
      dadtabus,
      insurance
    } = weights;

    const price =
      baseContinuity *
      rarityCurve *
      demandCurve *
      supplyCurve *
      collectorcheck *
      dadtabus *
      insurance;

    logInfo("Market price computed.");
    return Math.round(price);
  }
}