import { logInfo } from "../utils/log";

export interface ContinuityOption {
  id: string;
  collectibleId: string;
  type: "call" | "put";
  strike: number;
  spot: number;
  premium: number;
  epoch: number;
}

export class ContinuityOptionsEngine {
  // --------------------------------------------
  // Compute option premium using simplified Black-Scholes-like model
  // --------------------------------------------
  compute(type: "call" | "put", spot: number, strike: number, epoch: number): ContinuityOption {
    const volatility = 0.25; // synthetic continuity volatility
    const time = epoch / 100; // epoch scaled to time

    const intrinsic =
      type === "call"
        ? Math.max(0, spot - strike)
        : Math.max(0, strike - spot);

    const timeValue = spot * volatility * Math.sqrt(time);
    const premium = intrinsic + timeValue;

    logInfo("Option premium computed.");

    return {
      id: `option-${Date.now()}`,
      collectibleId: "",
      type,
      strike,
      spot,
      premium,
      epoch
    };
  }
}