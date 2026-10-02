import { logInfo } from "../utils/log";

export interface FundWeights {
  [collectibleId: string]: number;
}

export class FundStrategyEngine {
  // --------------------------------------------
  // Equal-weight strategy
  // --------------------------------------------
  equalWeight(ids: string[]): FundWeights {
    const w = 1 / ids.length;
    const weights: FundWeights = {};
    ids.forEach((id) => (weights[id] = w));
    logInfo("Equal-weight strategy computed.");
    return weights;
  }

  // --------------------------------------------
  // Sector-weight strategy (sector → overweight)
  // --------------------------------------------
  sectorWeight(ids: string[], sectorMap: Record<string, string>, targetSector: string): FundWeights {
    const weights: FundWeights = {};

    const targetIds = ids.filter((id) => sectorMap[id] === targetSector);
    const otherIds = ids.filter((id) => sectorMap[id] !== targetSector);

    const targetWeight = 0.7 / targetIds.length;
    const otherWeight = 0.3 / otherIds.length;

    targetIds.forEach((id) => (weights[id] = targetWeight));
    otherIds.forEach((id) => (weights[id] = otherWeight));

    logInfo("Sector-weight strategy computed.");
    return weights;
  }

  // --------------------------------------------
  // Epoch-weight strategy (higher epoch → higher weight)
  // --------------------------------------------
  epochWeight(ids: string[], epochMap: Record<string, number>): FundWeights {
    const totalEpoch = ids.reduce((a, id) => a + (epochMap[id] ?? 1), 0);
    const weights: FundWeights = {};

    ids.forEach((id) => {
      const e = epochMap[id] ?? 1;
      weights[id] = e / totalEpoch;
    });

    logInfo("Epoch-weight strategy computed.");
    return weights;
  }
}