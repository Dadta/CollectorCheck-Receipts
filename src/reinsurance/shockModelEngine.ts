import { logInfo } from "../utils/log";

export interface EpochShock {
  shockId: string;
  magnitude: number; // 0–100
  sector: string;
  epoch: number;
  description: string;
}

export class ShockModelEngine {
  // --------------------------------------------
  // Compute epoch shock magnitude
  // --------------------------------------------
  computeShock(sector: string, epoch: number, volatility: number): EpochShock {
    const base = volatility * 0.5;
    const epochFactor = epoch * 2;
    const sectorFactor = sector === "general" ? 1 : 1.2;

    const magnitude = Math.round(base * sectorFactor + epochFactor);

    const shock: EpochShock = {
      shockId: `shock-${Date.now()}`,
      magnitude,
      sector,
      epoch,
      description: `Epoch shock in sector ${sector} at epoch ${epoch}`
    };

    logInfo(`Epoch shock computed: ${magnitude}`);
    return shock;
  }
}