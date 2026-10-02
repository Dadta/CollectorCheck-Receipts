import { EpochShock } from "./shockModelEngine";
import { InsurancePremium } from "../insurance/premiumEngine";
import { logInfo } from "../utils/log";

export interface ReinsuranceLayer {
  layerId: string;
  type: "primary" | "secondary" | "catastrophe";
  retainedLoss: number;
  transferredLoss: number;
  shockMagnitude: number;
  insuredItems: string[];
}

export class ReinsuranceLayerEngine {
  // --------------------------------------------
  // Allocate losses across layers
  // --------------------------------------------
  allocate(premiums: InsurancePremium[], shock: EpochShock): ReinsuranceLayer[] {
    const totalLoss = shock.magnitude * 100; // synthetic loss model

    const primaryRetention = Math.min(totalLoss, 500);
    const secondaryRetention = Math.min(Math.max(totalLoss - primaryRetention, 0), 1000);
    const catastropheRetention = Math.max(totalLoss - primaryRetention - secondaryRetention, 0);

    const insuredItems = premiums.map((p) => p.collectibleId);

    const layers: ReinsuranceLayer[] = [
      {
        layerId: `primary-${Date.now()}`,
        type: "primary",
        retainedLoss: primaryRetention,
        transferredLoss: 0,
        shockMagnitude: shock.magnitude,
        insuredItems
      },
      {
        layerId: `secondary-${Date.now()}`,
        type: "secondary",
        retainedLoss: secondaryRetention,
        transferredLoss: primaryRetention,
        shockMagnitude: shock.magnitude,
        insuredItems
      },
      {
        layerId: `cat-${Date.now()}`,
        type: "catastrophe",
        retainedLoss: catastropheRetention,
        transferredLoss: primaryRetention + secondaryRetention,
        shockMagnitude: shock.magnitude,
        insuredItems
      }
    ];

    logInfo("Reinsurance layers allocated.");
    return layers;
  }
}