import { logInfo } from "../utils/log";

export interface SectorIndex {
  id: string;
  sector: string;
  value: number;
  components: string[];
}

export class SectorIndexEngine {
  // --------------------------------------------
  // Compute sector index (sector → continuity)
  // --------------------------------------------
  compute(prices: Record<string, number>, sectorMap: Record<string, string>): SectorIndex[] {
    const sectors: Record<string, number[]> = {};

    Object.entries(sectorMap).forEach(([id, sector]) => {
      if (!sectors[sector]) sectors[sector] = [];
      sectors[sector].push(prices[id] ?? 0);
    });

    const indices: SectorIndex[] = Object.entries(sectors).map(([sector, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      return {
        id: `sector-${sector}-${Date.now()}`,
        sector,
        value: Math.round(avg),
        components: Object.entries(sectorMap)
          .filter(([id, s]) => s === sector)
          .map(([id]) => id)
      };
    });

    logInfo("Sector indices computed.");
    return indices;
  }
}