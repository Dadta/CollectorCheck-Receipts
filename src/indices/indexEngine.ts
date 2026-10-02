import { logInfo } from "../utils/log";

export interface ContinuityIndex {
  id: string;
  name: string;
  value: number;
  components: string[];
}

export class ContinuityIndexEngine {
  // --------------------------------------------
  // Compute a simple weighted index
  // --------------------------------------------
  compute(prices: Record<string, number>, components: string[]): ContinuityIndex {
    const values = components.map((id) => prices[id] ?? 0);
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const index: ContinuityIndex = {
      id: `index-${Date.now()}`,
      name: "Continuity Composite",
      value: Math.round(avg),
      components
    };

    logInfo("Continuity index computed.");
    return index;
  }
}