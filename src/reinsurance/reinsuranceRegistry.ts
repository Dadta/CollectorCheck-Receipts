import { SyncRegistry } from "../sync/syncRegistry";
import { ContinuityInsuranceRegistry } from "../insurance/insuranceRegistry";
import { IndexRegistry } from "../indices/indexRegistry";
import { ShockModelEngine, EpochShock } from "./shockModelEngine";
import { ReinsuranceLayerEngine, ReinsuranceLayer } from "./reinsuranceLayerEngine";
import { logInfo } from "../utils/log";

export class ContinuityReinsuranceRegistry {
  private registry: SyncRegistry;
  private insurance: ContinuityInsuranceRegistry;
  private indices: IndexRegistry;

  private shockModel = new ShockModelEngine();
  private layerEngine = new ReinsuranceLayerEngine();

  private shocks: EpochShock[] = [];
  private layers: ReinsuranceLayer[] = [];

  constructor(registry: SyncRegistry, insurance: ContinuityInsuranceRegistry, indices: IndexRegistry) {
    this.registry = registry;
    this.insurance = insurance;
    this.indices = indices;
  }

  // --------------------------------------------
  // Recalculate reinsurance layers
  // --------------------------------------------
  recalc() {
    const bundle = this.registry.buildBundle();
    const collectibles = bundle.collectibles;
    const premiums = this.insurance.getPremiums();

    const volatilityIndex = this.indices.getVolatilityIndex();
    const volatility = volatilityIndex?.value ?? 0;

    // Compute shocks per sector
    collectibles.forEach((c: any) => {
      const shock = this.shockModel.computeShock(
        c.sector ?? "general",
        c.epoch ?? 1,
        volatility
      );

      this.shocks.push(shock);

      const layers = this.layerEngine.allocate(premiums, shock);
      this.layers.push(...layers);
    });

    logInfo("Reinsurance recalculated.");
  }

  getShocks() {
    return this.shocks;
  }

  getLayers() {
    return this.layers;
  }
}