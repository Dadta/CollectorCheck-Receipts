import { logInfo } from "../utils/log";

export interface VolatilityIndex {
  id: string;
  value: number;
  components: string[];
}

export class VolatilityIndexEngine {
  // --------------------------------------------
  // Compute volatility index (continuity VIX)
  // --------------------------------------------
  compute(prices: Record<string, number>, history: Record<string, number[]>): VolatilityIndex {
    const vols = Object.entries(history).map(([id, series]) => {
      if (series.length < 2) return 0;

      const diffs = [];
      for (let i = 1; i < series.length; i++) {
        diffs.push(Math.abs(series[i] - series[i - 1]));
      }

      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      return avg;
    });

    const vix = vols.length > 0
      ? vols.reduce((a, b) => a + b, 0) / vols.length
      : 0;

    const index: VolatilityIndex = {
      id: `vix-${Date.now()}`,
      value: Math.round(vix),
      components: Object.keys(history)
    };

    logInfo("Volatility index computed.");
    return index;
  }
}